class IsTutor(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'tutor')

class IsGuardian(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'guardian')
