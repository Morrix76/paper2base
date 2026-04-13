from __future__ import annotations

from app.core.config import get_settings


def _email_html(app_url: str, token: str) -> str:
    verify_url = f"{app_url.rstrip('/')}/verify?token={token}"
    return f"""\
<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Verifica email — Paper2Base</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #eef0f5;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:20px 22px;border-bottom:1px solid #eef0f5;">
                <div style="font-weight:900;letter-spacing:.5px;color:#111827;font-size:18px;">PAPER2BASE</div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px;">
                <h1 style="margin:0 0 10px 0;font-size:18px;line-height:1.2;color:#111827;">Verifica la tua email</h1>
                <p style="margin:0 0 14px 0;font-size:14px;line-height:1.5;color:#4b5563;">
                  Clicca il pulsante qui sotto per attivare il tuo account. Se non hai richiesto la registrazione, puoi ignorare questa email.
                </p>
                <div style="margin:16px 0 18px 0;">
                  <a href="{verify_url}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 16px;border-radius:10px;">
                    Verifica email
                  </a>
                </div>
                <p style="margin:0 0 6px 0;font-size:12px;color:#6b7280;">
                  Se il pulsante non funziona, copia e incolla questo link:
                </p>
                <p style="margin:0;font-size:12px;color:#111827;word-break:break-all;">
                  <a href="{verify_url}" style="color:#111827;">{verify_url}</a>
                </p>
                <hr style="border:none;border-top:1px solid #eef0f5;margin:18px 0;" />
                <p style="margin:0;font-size:12px;line-height:1.45;color:#6b7280;">
                  English: Click the button above to verify your email and activate your account.
                </p>
              </td>
            </tr>
          </table>
          <div style="max-width:560px;color:#9ca3af;font-size:11px;line-height:1.45;padding:10px 6px;">
            Paper2Base • Email automatica
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


def send_verification_email(email: str, token: str) -> None:
    settings = get_settings()
    api_key = (settings.get("resend_api_key") or "").strip()
    sender = (settings.get("resend_from") or "").strip()
    app_url = (settings.get("app_url") or "").strip()
    if not api_key:
        raise RuntimeError("RESEND_API_KEY is missing")
    if not sender:
        raise RuntimeError("RESEND_FROM is missing")
    if not app_url:
        app_url = "http://localhost:5173"

    import resend  # local import to keep import-time side effects minimal

    resend.api_key = api_key
    resend.Emails.send(
        {
            "from": sender,
            "to": email,
            "subject": "Verifica il tuo account Paper2Base / Verify your Paper2Base account",
            "html": _email_html(app_url, token),
        }
    )

