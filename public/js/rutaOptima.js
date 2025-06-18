const BASE = { lat: 11.650851303959218, lon: -70.22056764245828 };

const iconBase = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
    iconSize: [35, 35],
    iconAnchor: [17, 34],
    popupAnchor: [0, -28],
});

const iconPaquete = (numero) => L.divIcon({
    html: `<div style="background:#007bff;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:14px;">${numero}</div>`,
    className: 'paquete-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

export async function generarRuta(paquetes) {
    const contenedor = document.getElementById('paquetes-viaje');
    
    contenedor.innerHTML = `<div id="map" style="height: 400px;"></div><button id="btn-optimizar">Optimizar ruta</button><div id="lista-paquetes"></div>`;

    const map = L.map('map').setView([BASE.lat, BASE.lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(map);

    L.marker([BASE.lat, BASE.lon], { icon: iconBase })
        .addTo(map)
        .bindPopup("Almacén: Punta Cardón");

    console.log('Paquetes recibidos:', paquetes);
    paquetes.forEach(paquete => {
        let telefono = paquete.cliente_telefono || paquete.telefono || '';
        if (telefono.startsWith('0')) {
            telefono = '58' + telefono.slice(1);
        }
        const lat = Number(paquete.LAT);
        const lon = Number(paquete.LON);

        if (!isNaN(lat) && !isNaN(lon)) {
            L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`<b>${paquete.cliente_nombre1} ${paquete.cliente_apellido1}</b><br>Tel: ${telefono}`);
        } else {
            console.warn('Coordenadas inválidas para el paquete:', paquete);
        }
    });

    document.getElementById('btn-optimizar').addEventListener('click', () => {
        const puntos = paquetes
            .map(p => {
                let telefono = p.cliente_telefono || p.telefono || '';
                if (telefono.startsWith('0')) {
                    telefono = '58' + telefono.slice(1);
                }
                return {
                    id: p.id_paquete,
                    lat: Number(p.LAT),
                    lon: Number(p.LON),
                    cliente: `${p.cliente_nombre1} ${p.cliente_apellido1}`,
                    telefono: telefono
                };
            })
            .filter(p => !isNaN(p.lat) && !isNaN(p.lon));

        const ruta = [BASE];
        const restantes = [...puntos];

        let actual = BASE;

        while (restantes.length > 0) {
            let menor = 0;
            let minDist = Infinity;

            for (let i = 0; i < restantes.length; i++) {
                const d = distancia(actual.lat, actual.lon, restantes[i].lat, restantes[i].lon);
                if (d < minDist) {
                    menor = i;
                    minDist = d;
                }
            }

            actual = restantes.splice(menor, 1)[0];
            ruta.push(actual);
        }

        ruta.push(BASE);

        map.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

        L.marker([BASE.lat, BASE.lon], { icon: iconBase })
            .addTo(map)
            .bindPopup("Almacén: Punta Cardón");

        for (let i = 1; i < ruta.length; i++) {
            const a = ruta[i - 1];
            const b = ruta[i];

            L.polyline([[a.lat, a.lon], [b.lat, b.lon]], { color: 'blue' }).addTo(map);

            if (i < ruta.length) {
                const punto = ruta[i];
                L.marker([punto.lat, punto.lon], { icon: iconPaquete(i) })
                    .addTo(map)
                    .bindPopup(`${punto.cliente}`);
            }
        }

        const lista = document.getElementById('lista-paquetes');
        lista.innerHTML = '<h3>Ruta optimizada</h3>';

        const viajeData = [];

        for (let i = 1; i < ruta.length - 1; i++) {
            const p = ruta[i];

            // Formatea el teléfono aquí también
            let telefono = p.telefono || '';
            if (telefono.startsWith('0')) {
                telefono = '58' + telefono.slice(1);
            }

            const div = document.createElement('div');
            div.innerHTML = `
                <p><strong>#${i}</strong> ${p.cliente} - ${telefono}</p>
                <button class="entregado-btn" data-id="${p.id}">Entregado</button>
                <button onclick="window.open('https://wa.me/${telefono}')">Contactar</button>
                <input type="text" placeholder="Observación" id="obs-${p.id}" />
                <hr/>
            `;
            lista.appendChild(div);

            viajeData.push({
                id_paquete: p.id,
                orden_entrega: i,
                comentario: ''
            });
        }

        fetch('/api/paquetes/generarViaje', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res.json())
            .then(data => {
                const idViaje = data.id_viaje;

                document.querySelectorAll('.entregado-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const idPaquete = btn.dataset.id;
                        const obs = document.getElementById(`obs-${idPaquete}`).value;
                        const index = viajeData.findIndex(v => v.id_paquete == idPaquete);
                        if (index !== -1) viajeData[index].comentario = obs;

                        fetch('/api/paquetes/guardarViajeDetalles', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id_viaje: idViaje,
                                detalles: [viajeData[index]]
                            })
                        })
                            .then(res => res.json())
                            .then(() => alert(`Entregado paquete #${idPaquete}`))
                            .catch(err => alert('Error al guardar detalle.'));
                    });
                });
            });
    });
}

function distancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
