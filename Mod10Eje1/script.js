const form = document.getElementById('registrationForm');
const inputs = form.querySelectorAll('input');

// Mensajes de error personalizados
const errorMessages = {
    username: {
        valueMissing: 'El nombre de usuario es obligatorio',
        tooShort: 'El nombre debe tener al menos 3 caracteres'
    },
    email: {
        valueMissing: 'El correo electrónico es obligatorio',
        typeMismatch: 'Ingresa un correo electrónico válido'
    },
    password: {
        valueMissing: 'La contraseña es obligatoria',
        tooShort: 'La contraseña debe tener al menos 8 caracteres'
    },
    confirmPassword: {
        valueMissing: 'Confirma tu contraseña',
        mismatch: 'Las contraseñas no coinciden'
    },
    phone: {
        patternMismatch: 'Ingresa un número de 10 dígitos'
    },
    terms: {
        valueMissing: 'Debes aceptar los términos y condiciones'
    }
};

// Validación en tiempo real
inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) {
            validateField(input);
        }
        if (input.id === 'password') {
            checkPasswordStrength(input.value);
        }
    });
});

function validateField(input) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    // Validación especial para confirmación de contraseña
    if (input.id === 'confirmPassword') {
        const password = document.getElementById('password').value;
        if (input.value !== password) {
            showError(formGroup, errorElement, errorMessages.confirmPassword.mismatch);
            return false;
        }
    }
    
    // Validación estándar HTML5
    if (!input.checkValidity()) {
        const errorType = getErrorType(input.validity);
        const message = errorMessages[input.name]?.[errorType] || 'Campo inválido';
        showError(formGroup, errorElement, message);
        return false;
    }
    
    showSuccess(formGroup, errorElement);
    return true;
}

function getErrorType(validity) {
    if (validity.valueMissing) return 'valueMissing';
    if (validity.typeMismatch) return 'typeMismatch';
    if (validity.tooShort) return 'tooShort';
    if (validity.patternMismatch) return 'patternMismatch';
    return 'invalid';
}

function showError(formGroup, errorElement, message) {
    formGroup.classList.add('error');
    formGroup.classList.remove('valid');
    formGroup.querySelector('input').classList.add('invalid');
    formGroup.querySelector('input').classList.remove('valid');
    errorElement.textContent = message;
}

function showSuccess(formGroup, errorElement) {
    formGroup.classList.remove('error');
    formGroup.classList.add('valid');
    formGroup.querySelector('input').classList.remove('invalid');
    formGroup.querySelector('input').classList.add('valid');
    errorElement.textContent = '';
}

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    let strength = 0;
    
    // Criterios de fortaleza
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    // Actualizar visualización
    strengthBar.className = 'strength-bar';
    
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Débil';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Media';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Fuerte';
    }
}

// Manejo del submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validar todos los campos
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (isValid) {
        // Obtener datos del formulario
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        console.log('Formulario válido:', data);
        alert('¡Registro exitoso! Revisa la consola para ver los datos.');
        
        // Aquí normalmente enviarías los datos al servidor
        // fetch('/api/register', { method: 'POST', body: JSON.stringify(data) })
    } else {
        alert('Por favor, corrige los errores del formulario');
    }
});
