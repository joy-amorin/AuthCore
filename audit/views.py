from django.shortcuts import render
from rest_framework.viewsets import ReadOnlyModelViewSet
from audit.models import AuditLog
from audit.serializer import AuditLogSerializer
from audit.permissions import IsSuperUser

# Create your views here.

class AuditLogViewSet(ReadOnlyModelViewSet):
    """
    A viewset for viewing audit log instances.
    """
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [IsSuperUser]
