from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'id': {'read_only': True},
        }

    def validate_email(self, value):
        # Avoid duplicates and normalize to lowercase
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este mail")
        return value.lower()

    def validate_password(self, value):
        # Use Django validators (length, complexity...)
        validate_password(value)
        return value

    def create(self, validated_data):
        # Create user using the custom manager
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user
