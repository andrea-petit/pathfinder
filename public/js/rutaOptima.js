const BASE = { lat: 11.650851303959218, lon: -70.22056764245828 };

const iconBase = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
  iconSize: [35, 35],
  iconAnchor: [17, 34]
});

const iconPaquete = i => L.divIcon({
  html: `<div style="background:#007bff;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;">${i}</div>`,
  className: 'paquete-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const iconCamion = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/679/679720.png',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});


function problemaViajanteTSP(matriz) {
  const n = matriz.length;
  const visitados = Array(n).fill(false);
  let ruta = [0];
  visitados[0] = true;
  let actual = 0;

  for (let paso = 1; paso < n; paso++) {
    let siguiente = -1, minDist = Infinity;
    for (let j = 1; j < n; j++) { 
      if (!visitados[j] && matriz[actual][j] < minDist) {
        minDist = matriz[actual][j];
        siguiente = j;
      }
    }
    if (siguiente !== -1) {
      ruta.push(siguiente);
      visitados[siguiente] = true;
      actual = siguiente;
    }
  }
  return ruta;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function matrizHaversine(puntos) {
  const n = puntos.length;
  const matriz = Array.from({length: n}, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        matriz[i][j] = haversine(
          Number(puntos[i].LAT), Number(puntos[i].LON),
          Number(puntos[j].LAT), Number(puntos[j].LON)
        );
      }
    }
  }
  return matriz;
}

export async function generarRuta(paquetes) {
  const cont = document.getElementById('paquetes-viaje');
  cont.style.display = 'block';
  cont.innerHTML = `
    <div id="map" style="height:400px;"></div>
    <button id="btn-optimizar">Optimizar ruta</button>
    <div id="lista-paquetes"></div>
  `;

  const map = L.map('map').setView([BASE.lat, BASE.lon], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.marker([BASE.lat, BASE.lon], { icon: iconBase }).addTo(map).bindPopup("Almacén");

  let marcadores = new Map();

  paquetes.forEach((p, i) => {
    const lat = Number(p.LAT), lon = Number(p.LON);
    if (!isNaN(lat) && !isNaN(lon)) {
      const tel = p.cliente_telefono.replace(/^0/, '58');
      const m = L.marker([lat, lon], { icon: iconPaquete(i + 1) })
        .addTo(map).bindPopup(`${p.cliente_nombre1} ${p.cliente_apellido1}`);
      marcadores.set(p.id_paquete, m);
    }
  });

  const list = document.getElementById('lista-paquetes');
  list.innerHTML = `<h3>Paquetes seleccionados</h3>`;
  paquetes.forEach((p, i) => {
    const tel = p.cliente_telefono.replace(/^0/, '58');
    const div = document.createElement('div');
    div.innerHTML = `
      <p>
        <strong>#${i + 1}</strong> ${p.cliente_nombre1} ${p.cliente_apellido1} - ${tel}
      </p>
      <hr>`;
    list.appendChild(div);
  });

  document.getElementById('btn-optimizar').onclick = async () => {
    list.style.display = 'none';

    const coords = [
      [BASE.lon, BASE.lat],
      ...paquetes.map(p => [Number(p.LON), Number(p.LAT)])
    ];

    const puntos = [
      { LAT: BASE.lat, LON: BASE.lon },
      ...paquetes.map(p => ({ LAT: p.LAT, LON: p.LON }))
    ];

    let distMatrix;
    let modoDemo = false;

    try {
      const matrixRes = await fetch('/api/openr/ors-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locations: coords,
          metrics: ['distance'],
          units: 'm'
        })
      });
      const matrixData = await matrixRes.json();
      if (!matrixData.distances) throw new Error('ORS no disponible');
      distMatrix = matrixData.distances;
    } catch (e) {
      modoDemo = true;
      alert('Servicio de rutas no disponible, usando modo demo (distancia por aire).');
      distMatrix = matrizHaversine(puntos);
    }

    const ordenIndices = problemaViajanteTSP(distMatrix);
    const ordenPaquetes = ordenIndices.slice(1).map(i => paquetes[i - 1]);

    let geoLayer;
    if (!modoDemo) {
      try {
        const res = await fetch('/api/openr/ors-directions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coordinates: [
            [BASE.lon, BASE.lat],
            ...ordenPaquetes.map(p => [Number(p.LON), Number(p.LAT)]),
            [BASE.lon, BASE.lat]
          ] })
        });
        const data = await res.json();
        const geo = data.features[0].geometry;
        geoLayer = L.geoJSON(geo, { style: { color: 'blue', weight: 4 } }).addTo(map);
        map.fitBounds(geoLayer.getBounds());
      } catch (e) {
        modoDemo = true;
      }
    }
    if (modoDemo) {
      const latlngs = [
        [BASE.lat, BASE.lon],
        ...ordenPaquetes.map(p => [Number(p.LAT), Number(p.LON)]),
        [BASE.lat, BASE.lon]
      ];
      geoLayer = L.polyline(latlngs, { color: 'red', weight: 4, dashArray: '5,10' }).addTo(map);
      map.fitBounds(geoLayer.getBounds());
    }

    ordenPaquetes.forEach((p, i) => {
      const oldMarker = marcadores.get(p.id_paquete);
      if (oldMarker) map.removeLayer(oldMarker);

      const m = L.marker([Number(p.LAT), Number(p.LON)], { icon: iconPaquete(i + 1) })
        .addTo(map).bindPopup(`${p.cliente_nombre1} ${p.cliente_apellido1}`);
      marcadores.set(p.id_paquete, m);
    });

    list.style.display = '';
    list.innerHTML = `<h3>Ruta optimizada${modoDemo ? ' (DEMO: por aire)' : ''}</h3>`;
    let viajeData = [];

    ordenPaquetes.forEach((p, i) => {
      const tel = p.cliente_telefono.replace(/^0/, '58');
      const div = document.createElement('div');
      div.innerHTML = `
        <p><strong#${i + 1}</strong> ${p.cliente_nombre1} ${p.cliente_apellido1} - ${tel}
          <button class="entregado-btn" data-id="${p.id_paquete}">Entregado</button>
          <button onclick="window.open('https://wa.me/${tel}')">WhatsApp</button>
          <input type="text" id="obs-${p.id_paquete}" placeholder="Observación"/>
        </p><hr>`;
      list.appendChild(div);

      viajeData.push({ id_paquete: p.id_paquete, orden_entrega: i + 1, comentario: '' });
    });

    let id_viaje = 1;
    if (!modoDemo) {
      const resViaje = await fetch('/api/paquetes/generarViaje', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
      });
      const data = await resViaje.json();
      id_viaje = data.id_viaje;
    }

    document.querySelectorAll('.entregado-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const idx = viajeData.findIndex(v => v.id_paquete == id);
        if (idx < 0) return alert('Paquete no encontrado');

        viajeData[idx].comentario = document.getElementById(`obs-${id}`).value;

        if (!modoDemo) {
          const guard = await fetch('/api/paquetes/guardarViajeDetalles', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_viaje, detalles: [viajeData[idx]] })
          });
          if (!guard.ok) return alert('Error al guardar');
        }

        btn.disabled = true;
        btn.style.background = '#4caf50';
        const m = marcadores.get(parseInt(id));
        if (m) m.setIcon(iconCamion);

        if (document.querySelectorAll('.entregado-btn:enabled').length === 0) {
          setTimeout(() => alert('Viaje completado'), 500);
        }
      };
    });
  };
}