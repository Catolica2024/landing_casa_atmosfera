<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get JSON data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $nombre = $data['nombre'] ?? '';
    $whatsapp = $data['whatsapp'] ?? '';
    $email = $data['email'] ?? '';
    $casa = $data['casa'] ?? '';
    $mensaje = $data['mensaje'] ?? '';

    $to = "informacion@casaatmosfera.com";
    $subject = "Nuevo prospecto: Casa Atmósfera - " . $nombre;

    // Premium Email Template
    $htmlContent = "
    <html>
    <head>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #E5DBD1; margin: 0; padding: 30px; }
        .container { background-color: #ffffff; max-width: 550px; margin: 0 auto; padding: 40px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { text-align: center; border-bottom: 1px solid #E5DBD1; padding-bottom: 25px; margin-bottom: 30px; }
        .header h1 { color: #32332D; font-size: 22px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; margin: 0; }
        .content { color: #32332D; line-height: 1.6; }
        .field { margin-bottom: 20px; }
        .label { font-weight: 600; color: #858D8F; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; margin-bottom: 6px; display: block; }
        .value { font-size: 15px; color: #32332D; background-color: #FAFAFA; padding: 12px 15px; border-radius: 4px; border-left: 3px solid #32332D; }
        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #858D8F; letter-spacing: 1px; text-transform: uppercase; }
    </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Nuevo Contacto</h1>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>Nombre</span>
                    <div class='value'>{$nombre}</div>
                </div>
                <div class='field'>
                    <span class='label'>WhatsApp</span>
                    <div class='value'>{$whatsapp}</div>
                </div>
                <div class='field'>
                    <span class='label'>Correo Electrónico</span>
                    <div class='value'>{$email}</div>
                </div>
                <div class='field'>
                    <span class='label'>Casa de Interés</span>
                    <div class='value'>{$casa}</div>
                </div>
                <div class='field'>
                    <span class='label'>Mensaje Adicional</span>
                    <div class='value'>" . nl2br(htmlspecialchars($mensaje)) . "</div>
                </div>
            </div>
            <div class='footer'>
                Casa Atmósfera | Pilates & Movimiento
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: web@casaatmosfera.com" . "\r\n";
    $headers .= "Reply-To: {$email}" . "\r\n";

    if (mail($to, $subject, $htmlContent, $headers)) {
        echo json_encode(["status" => "success", "message" => "Mensaje enviado exitosamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Ocurrió un error al enviar el mensaje."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Método no permitido."]);
}
?>
