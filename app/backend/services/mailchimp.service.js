const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const mailchimp = require("@mailchimp/mailchimp_transactional")(process.env.MANDRILL_API_KEY);

/**
 * Renderiza una plantilla HTML almacenada en /emails usando Handlebars
 */
async function renderTemplate(templateFile, data) {
    const fullPath = path.join(__dirname, "../emails", templateFile);

    const source = fs.readFileSync(fullPath, "utf8");
    const template = handlebars.compile(source);

    return template(data);
}

/**
 * Envía correo usando Mandrill
 */
async function sendEmail({ to, subject, html }) {
    try {
        const response = await mailchimp.messages.send({
            message: {
                from_email: process.env.MANDRILL_FROM_EMAIL,
                from_name: process.env.MANDRILL_FROM_NAME || "ImpreIdeas",
                subject,
                html,
                to: [{ email: to, type: "to" }]
            }
        });

        console.log("📨 Mandrill response:", response);
        return response;
    } catch (err) {
        console.error("❌ Error enviando correo vía Mandrill:", err);
        throw err;
    }
}

/**
 * Email para el CLIENTE con el detalle de su cotización
 */
async function sendClientQuoteEmail(quote, items) {
    const html = await renderTemplate("../email/templates/client-quote.email.html", {
        ...quote,
        items,
        year: new Date().getFullYear(),
        total: quote.totalAmount
    });

    return sendEmail({
        to: quote.email,
        subject: `Tu cotización ${quote.quoteNumber} — ImpreIdeas`,
        html
    });
}

/**
 * Email para el NEGOCIO avisando nueva cotización
 */
async function sendBusinessNotificationEmail(quote, items) {
    const html = await renderTemplate("../email/templates/business-notification.email.html", {
        ...quote,
        items,
        year: new Date().getFullYear(),
        total: quote.totalAmount
    });

    return sendEmail({
        to: process.env.BUSINESS_AUTO_EMAIL,
        subject: `Nueva cotización recibida — ${quote.quoteNumber}`,
        html
    });
}

module.exports = {
    sendEmail,
    renderTemplate,
    sendClientQuoteEmail,
    sendBusinessNotificationEmail
};