<?php
header('Content-Type: application/json');

// ============================================================
//  CONFIGURACIÓN SMTP – Ajusta estos valores en tu hosting
// ============================================================
define('SMTP_HOST',   'localhost');              // Usamos localhost en vez del dominio
define('SMTP_USER',   'web@casaatmosfera.com');  // Cuenta creada en cPanel
define('SMTP_PASS',   'b[Un*PIYa01IbB}g');     // Contraseña de esa cuenta
define('SMTP_PORT',   587);                       // 587 suele funcionar mejor en localhost
define('SMTP_SECURE', '');                        // Dejamos vacío para conexión local directa
define('MAIL_TO',     'informacion@casaatmosfera.com');
// ============================================================

// Cargar PHPMailer (Opción A: Composer)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    // Opción B: Archivos descargados manualmente en /phpmailer/
    require __DIR__ . '/phpmailer/Exception.php';
    require __DIR__ . '/phpmailer/PHPMailer.php';
    require __DIR__ . '/phpmailer/SMTP.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Método no permitido."]);
    exit;
}

// Leer datos del formulario
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!is_array($data)) {
    echo json_encode(["status" => "error", "message" => "Datos inválidos."]);
    exit;
}

// Sanitizar entradas
$nombre_raw   = trim($data['nombre']   ?? '');
$whatsapp_raw = trim($data['whatsapp'] ?? '');
$email_raw    = trim($data['email']    ?? '');
$casa_raw     = trim($data['casa']     ?? '');
$mensaje_raw  = trim($data['mensaje']  ?? '');
$is_popup     = isset($data['is_popup']) && $data['is_popup'];

// ── Validación servidor ──────────────────────────────────────
$errors = [];

// Nombre: solo letras (incluye tildes y ñ), mín 2 caracteres
if (strlen($nombre_raw) < 2 || !preg_match('/^[\p{L}\s\'\-]+$/u', $nombre_raw)) {
    $errors[] = "Nombre inválido.";
}

// WhatsApp: solo dígitos, espacios, +, -, paréntesis. Entre 7 y 15 dígitos.
$wa_digits = preg_replace('/[^\d]/', '', $whatsapp_raw);
if (strlen($wa_digits) < 7 || strlen($wa_digits) > 15) {
    $errors[] = "WhatsApp inválido.";
}

// Email válido
if (!filter_var($email_raw, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Correo electrónico inválido.";
}

// Casa: debe ser uno de los valores permitidos (o vacío si viene del popup)
$casas_validas = ['balance', 'control', 'energy', 'todas', 'no-se', ''];
if (!in_array($casa_raw, $casas_validas, true)) {
    $errors[] = "Casa de interés inválida.";
}

// Mensaje: máximo 500 caracteres
if (strlen($mensaje_raw) > 500) {
    $errors[] = "El mensaje supera los 500 caracteres.";
}

if (!empty($errors)) {
    echo json_encode(["status" => "error", "message" => implode(' ', $errors)]);
    exit;
}

// Escapar para HTML
$nombre   = htmlspecialchars($nombre_raw,   ENT_QUOTES, 'UTF-8');
$whatsapp = htmlspecialchars($whatsapp_raw, ENT_QUOTES, 'UTF-8');
$email    = htmlspecialchars($email_raw,    ENT_QUOTES, 'UTF-8');
$casa     = htmlspecialchars($casa_raw ?: 'N/A', ENT_QUOTES, 'UTF-8');
$mensaje  = htmlspecialchars($mensaje_raw ?: 'N/A', ENT_QUOTES, 'UTF-8');

// Plantilla HTML del correo
$titulo_correo = $is_popup ? "Nueva Solicitud: Socia Fundadora" : "Nuevo Contacto";
$subtitulo = $is_popup ? "Interesada en ser Socia Fundadora" : "Nuevo Contacto";
$color_borde = $is_popup ? "#1B3B36" : "#32332D";

$htmlContent = "
<html>
<head>
<style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #E5DBD1; margin: 0; padding: 30px; }
    .container { background-color: #ffffff; max-width: 550px; margin: 0 auto; padding: 40px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 1px solid #E5DBD1; padding-bottom: 25px; margin-bottom: 30px; }
    .header h1 { color: {$color_borde}; font-size: 22px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; margin: 0; }
    .content { color: #32332D; line-height: 1.6; }
    .field { margin-bottom: 20px; }
    .label { font-weight: 600; color: #858D8F; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; margin-bottom: 6px; display: block; }
    .value { font-size: 15px; color: #32332D; background-color: #FAFAFA; padding: 12px 15px; border-radius: 4px; border-left: 3px solid {$color_borde}; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #858D8F; letter-spacing: 1px; text-transform: uppercase; }
</style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>{$subtitulo}</h1>
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
            </div>";

if (!$is_popup) {
$htmlContent .= "
            <div class='field'>
                <span class='label'>Casa de Interés</span>
                <div class='value'>{$casa}</div>
            </div>
            <div class='field'>
                <span class='label'>Mensaje Adicional</span>
                <div class='value'>" . nl2br($mensaje) . "</div>
            </div>";
}

$htmlContent .= "
        </div>
        <div class='footer'>
            Casa Atmósfera | Pilates &amp; Movimiento
        </div>
    </div>
</body>
</html>
";

// Enviar con PHPMailer
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = SMTP_SECURE;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(SMTP_USER, 'Casa Atmósfera Web');
    $mail->addAddress(MAIL_TO, 'Casa Atmósfera');

    if (!empty($email)) {
        $mail->addReplyTo($email, $nombre);
    }

    $mail->isHTML(true);
    $mail->Subject = "{$titulo_correo}: Casa Atmósfera – {$nombre}";
    $mail->Body    = $htmlContent;
    $mail->AltBody = "Nombre: {$nombre}\nWhatsApp: {$whatsapp}\nEmail: {$email}\nCasa: {$casa}\nMensaje: {$mensaje}\nPopup: " . ($is_popup ? 'SI' : 'NO');

    $mail->send();
    echo json_encode(["status" => "success", "message" => "Mensaje enviado exitosamente."]);

} catch (Exception $e) {
    echo json_encode([
        "status"  => "error",
        "message" => "Error al enviar el mensaje. Por favor intenta de nuevo.",
        "debug"   => $mail->ErrorInfo // Puedes quitar esta línea en producción
    ]);
}
?>
