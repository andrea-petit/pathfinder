function autenticacion(req, res, next) {
    if (req.session && req.session.id_empleado) {
        next();
    } else {
        res.redirect('/login');
        return;
    }
}

module.exports = autenticacion;