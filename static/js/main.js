document.addEventListener('DOMContentLoaded', function() {
    const toggleBtn = document.getElementById('toggleBtn');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }

    const style = document.createElement('style');
    style.textContent = `
        .mensaje {
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .mensaje.success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .mensaje.error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .mensaje.info {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .sidebar a {
            text-decoration: none;
            color: inherit;
        }
        .top-buttons a {
            text-decoration: none;
            color: inherit;
        }
        .sidebar button, .top-buttons button {
            background: none;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            padding: 10px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .sidebar button:hover, .top-buttons button:hover {
            background-color: rgba(0,0,0,0.1);
        }
        .top-buttons button.selected {
            background-color: #007bff;
            color: white;
        }
        .dia-checkbox {
            display: flex;
            align-items: center;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .dia-checkbox:hover {
            background-color: #f8f9fa;
        }
        .dia-checkbox input[type="checkbox"] {
            margin-right: 8px;
            transform: scale(1.2);
        }
        .dia-checkbox input[type="checkbox"]:checked + span {
            font-weight: bold;
            color: #007bff;
        }
        #horario-personalizado {
            border: 1px solid #e9ecef;
            padding: 15px;
            border-radius: 5px;
            background-color: #f8f9fa;
        }
        #link-virtual {
            border: 1px solid #e9ecef;
            padding: 15px;
            border-radius: 5px;
            background-color: #f0f8ff;
        }
        #link-virtual input[type="url"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        #link-virtual input[type="url"]:focus {
            border-color: #007bff;
            outline: none;
            box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }
    `;
    document.head.appendChild(style);
});
