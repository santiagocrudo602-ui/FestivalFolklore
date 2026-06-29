const adminAuth = (req, res, next) => {
    // Se espera que este middleware se ejecute DESPUES de authMiddleware
    // por lo tanto, req.user ya debería existir
    if (!req.user || req.user.rol !== 'admin') {
        return res.status(403).json({ success: false, message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};

module.exports = adminAuth;
