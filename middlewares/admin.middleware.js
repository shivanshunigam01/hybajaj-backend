const { requireRoles } = require('./auth.middleware');
const { ROLES } = require('../config/constants');

module.exports = {
  adminMiddleware: requireRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  staffMiddleware: requireRoles(
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.SALES,
    ROLES.FINANCE,
    ROLES.SERVICE_MANAGER,
    ROLES.TRAINER,
    ROLES.RECEPTION
  ),
};
