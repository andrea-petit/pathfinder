const reporteModel = require('../models/reporteModel');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const fs = require('fs');
const path = require('path');

const reporteController = {
  generarReporteViajes: async (req, res) => {
    try {
      const { fechaInicio, fechaFin } = req.body;

      const datos = await reporteModel.getReporteViajes(fechaInicio, fechaFin);

      function agruparViajes(data) {
        const agrupados = {};
        data.forEach(row => {
          const id = row.id_viaje;
          if (!agrupados[id]) {
            agrupados[id] = {
              fecha: row.fecha,
              empleado: `${row.nombre1} ${row.apellido1}`,
              vehiculo: row.placa ? `${row.placa} - ${row.marca} ${row.modelo}` : 'No asignado',
              entregas: []
            };
          }
          agrupados[id].entregas.push({
            paquete: row.id_paquete,
            cliente: `${row.cliente_nombre} ${row.cliente_apellido}`,
            direccion: `${row.calle}, ${row.sector}, ${row.estado}, ${row.pais}`,
            orden: row.orden_entrega,
            estado: row.estado_entrega,
            eta: row.eta_estimada,
            observacion: row.observacion || 'Sin observaciones'
          });
        });
        return Object.values(agrupados);
      }

      const viajes = agruparViajes(datos);

      const templateHtml = fs.readFileSync(
        path.join(__dirname, '../public/templates/reporteViajes.html'),
        'utf8'
      );
      const template = hbs.compile(templateHtml);
      const htmlFinal = template({ fechaInicio, fechaFin, viajes });

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '40px', bottom: '40px', left: '30px', right: '30px' }
      });

      await browser.close();

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte_viajes_${fechaInicio}_al_${fechaFin}.pdf"`
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error al generar el reporte:', error);
      res.status(500).send('Error al generar el reporte PDF');
    }
  }
};

module.exports = reporteController;
