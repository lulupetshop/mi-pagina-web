<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/PHPMailer/Exception.php';
require_once __DIR__ . '/../lib/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../lib/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

/**
 * Registra en un archivo propio (api/mp/mail-debug.log) en vez de
 * depender de dónde el hosting tenga configurado el log de errores de
 * PHP, que varía y no siempre es fácil de encontrar.
 */
function lulu_mail_log(string $linea): void
{
    $fecha = (new DateTime())->format('Y-m-d H:i:s');
    @file_put_contents(__DIR__ . '/mail-debug.log', "[{$fecha}] {$linea}\n", FILE_APPEND | LOCK_EX);
}

/**
 * Manda un mail por SMTP real (no el mail() de PHP, que en hosting
 * compartido suele fallar de forma intermitente/silenciosa). Si faltan
 * credenciales SMTP en config.php, no intenta nada y devuelve false.
 * Cualquier intento (éxito o error) queda registrado en mail-debug.log
 * en vez de perderse en silencio.
 */
function lulu_enviar_mail(string $destinatario, string $asunto, string $textoPlano, string $html): bool
{
    lulu_mail_log("Intentando enviar a {$destinatario}...");

    $config = lulu_config();

    $smtpHost = trim((string) ($config['smtp_host'] ?? ''));
    $smtpUser = trim((string) ($config['smtp_user'] ?? ''));
    $smtpPass = (string) ($config['smtp_pass'] ?? '');
    $smtpPort = (int) ($config['smtp_port'] ?? 465);
    $smtpSecure = trim((string) ($config['smtp_secure'] ?? 'ssl'));

    if ($smtpHost === '' || $smtpUser === '' || $smtpPass === '') {
        lulu_mail_log('ERROR: faltan credenciales SMTP en config.php (smtp_host/smtp_user/smtp_pass).');
        return false;
    }

    $from = (string) ($config['mail_from'] ?? $smtpUser);
    $fromName = (string) ($config['mail_from_name'] ?? 'Lulú Lulú');

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $smtpHost;
        $mail->SMTPAuth = true;
        $mail->Username = $smtpUser;
        $mail->Password = $smtpPass;
        $mail->SMTPSecure = $smtpSecure === 'tls' ? PHPMailer::ENCRYPTION_STARTTLS : PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = $smtpPort;
        $mail->CharSet = 'UTF-8';

        $mail->setFrom($from, $fromName);
        $mail->addAddress($destinatario);

        $mail->isHTML(true);
        $mail->Subject = $asunto;
        $mail->Body = $html;
        $mail->AltBody = $textoPlano;

        $mail->send();
        lulu_mail_log("OK: mail enviado a {$destinatario}.");
        return true;
    } catch (PHPMailerException $e) {
        lulu_mail_log('ERROR al enviar - ' . $mail->ErrorInfo);
        return false;
    }
}
