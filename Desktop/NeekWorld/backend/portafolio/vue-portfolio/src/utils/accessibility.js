export function toggleAccessibilityMode(mode) {
    const body = document.body;
    body.classList.remove('colorblind-mode', 'descanso-visual', 'modo-nocturno', 'normal');

    switch (mode) {
        case 'colorblind':
            body.classList.add('colorblind-mode');
            break;
        case 'descanso-visual':
            body.classList.add('descanso-visual');
            break;
        case 'modo-nocturno':
            body.classList.add('modo-nocturno');
            break;
        default:
            body.classList.add('normal');
            break;
    }

    applyAccessibilityStyles();
}

function applyAccessibilityStyles() {
    const sections = document.querySelectorAll('.header, .presentation, .about-section, .playground-section, .work-section, .education-section');
    sections.forEach(section => {
        // First remove all accessibility classes
        section.classList.remove('descanso-visual', 'daltonismo', 'modo-nocturno', 'normal');
        
        // Then apply the appropriate class based on the body class
        if (document.body.classList.contains('descanso-visual')) {
            section.classList.add('descanso-visual');
        } else if (document.body.classList.contains('colorblind-mode')) {
            // Changed from 'daltonismo' to 'daltonismo' for consistency
            section.classList.add('daltonismo');
        } else if (document.body.classList.contains('modo-nocturno')) {
            section.classList.add('modo-nocturno');
        } else {
            section.classList.add('normal');
        }
    });

    // Ensure modals and other dynamic elements maintain proper layout in colorblind mode
    const modals = document.querySelectorAll('.radio-modal');
    modals.forEach(modal => {
        if (document.body.classList.contains('colorblind-mode')) {
            // Apply special handling for modals in colorblind mode
            modal.classList.add('daltonismo');
        }
    });
}