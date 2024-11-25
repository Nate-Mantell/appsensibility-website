/**
 * POST /api/submit
 */
export async function onRequestPost(context) {
    try {
      /*let input = await context.request.formData();
  
      // Convert FormData to JSON
      // NOTE: Allows multiple values per key
      let output = {};
      for (let [key, value] of input) {
        let tmp = output[key];
        if (tmp === undefined) {
          output[key] = value;
        } else {
          output[key] = [].concat(tmp, value);
        }
      }
  
      let pretty = JSON.stringify(output, null, 2);
      console.log("Got form sumission", pretty);
      return new Response(pretty, {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });*/
      const jsonBody = await context.request.json(); // Parse JSON payload
        console.log("Received JSON body:", JSON.stringify(jsonBody, null, 2));

        // Send email using SendGrid
        const emailResponse = await sendEmail(jsonBody);

        return new Response(JSON.stringify(jsonBody, null, 2), {
            headers: { "Content-Type": "application/json;charset=utf-8" },
        });
    } catch (err) {
      return new Response("Error parsing JSON content", { status: 400 });
    }
  }


  // Function to send an email using SendGrid
async function sendEmail(formData) {
    console.log("sendEmail - begin");
    const sendGridApiKey = process?.env?.SENDGRID_API_KEY || 'couldnt-read-env'; // Replace with your SendGrid API key
    console.log("SendGrid API key:", sendGridApiKey);
    const sendGridUrl = "https://api.sendgrid.com/v3/mail/send";

    // Construct the email payload
    const emailPayload = {
        personalizations: [
            {
                to: [{ email: "nate@appsensibility.com" }], // Replace with your recipient email
                subject: "New Contact Form Submission",
            },
        ],
        from: { email: "nate@appsensibility.com" }, // Replace with your sender email
        content: [
            {
                type: "text/plain",
                value: `
                You have a new form submission:
                Name: ${formData.name}
                Email: ${formData.email}
                Message: ${formData.message}
                `,
            },
        ],
    };

    // Send the email using fetch
    const response = await fetch(sendGridUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${sendGridApiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return response.json();
}