/**
 * CampusSafe - Main JavaScript Client Helper
 * Handles Bootstrap initialization, interactive validation, and dashboard charts.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auto-dismiss alerts after 6 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            if (bsAlert) {
                bsAlert.close();
            }
        }, 6000);
    });

    // 2. Client-side Form Validation
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // 3. Confirm Delete Prompts
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', event => {
            const message = button.getAttribute('data-confirm-delete') || "Are you sure you want to delete this record?";
            if (!confirm(message)) {
                event.preventDefault();
            }
        });
    });

    // 4. Initialize Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});
