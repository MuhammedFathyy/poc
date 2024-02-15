const express = require('express');
const app = express();
const port = 3000;
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
const axios = require('axios');
app.use(express.urlencoded({ extended: true }));
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit:1024*1024*10, type:'application/json'}))
var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "4a36feac0c4e8d",
      pass: "0443acf3e0126e"
    }
});




const uploads = multer({dest: __dirname + "/uploads"})

const https = require('https');
let keycloakId;
const path = require('path');

// set static directories
app.use(express.static(path.join(__dirname, 'public')));
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose
.connect('mongodb+srv://admin:5260069Mido@cluster0.nooe2kh.mongodb.net/POCDEV?retryWrites=true&w=majority')
.then(() => console.log("connected"))
mongoose.set("strictQuery", false)

app.get('/', (req, res) => {
    keycloakId = req.query.id;
    res.render(path.join(__dirname+ '/public/views/index.ejs'));
});

app.post('/submit', async (req, res) => {
    console.log(keycloakId)
   const user = await User.create(req.body);
   await transport.sendMail({
        from: "Open Test",
        to: "test@test.com",
        subject: "testing",
        html: `
        <h1>A new user with name ${user.name}</h1>
        <a href="http://localhost:3000/view-user/${user.id}/${keycloakId}">View User</a>
        `
   })

  res.redirect("https://apic-nonpr-459450ca-portal-web-cp4i-nonprod.apps.nt-non-ocp.neotek.sa/mfa-developer-portal/test-cat/");
})

app.get('/download-pdf/:userId', async (req, res) => {
    const user = await User.findOne({_id: req.params.userId});
    // Decode Base64 string to binary data
    const pdfBuffer = Buffer.from(user.file, 'base64');

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="downloaded.pdf"');

    // Send the PDF buffer as the response
    res.send(pdfBuffer);
});


app.get("/view-user/:id/:keycloakId", async (req, res) => {
    const user = await User.findOne({_id: req.params.id});
    const name = user.name;
    const userId = user.id;
    res.render(path.join(__dirname+ '/public/views/user.ejs'), {name:name, id: req.params.keycloakId, userId: userId});
})

app.post("/approve/:id", async (req, res) => {
    const token = await getAdminToken();
    approve(req.params.id, token);
    res.render(path.join(__dirname+ '/public/views/index.ejs'));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const agent = new https.Agent({  
    rejectUnauthorized: false
});
async function getAdminToken() {
    try {
        const keycloakBaseUrl = 'https://keycloak-sit-vaps-sit.apps.nt-non-ocp.neotek.sa/realms/master';
        const clientId = 'apic-internal-client';
        const clientSecret = 'wZAckatWhIVItMsZq88DziJOgdGKQPVp';

        const tokenEndpoint = `${keycloakBaseUrl}/protocol/openid-connect/token`;

        const data = new URLSearchParams();
        data.append('grant_type', 'client_credentials');
        data.append('client_id', clientId);
        data.append('client_secret', clientSecret);

        const response = await axios.post(tokenEndpoint, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            httpsAgent: agent
        });

        const accessToken = response.data.access_token;
        console.log('Admin token:', accessToken);
        return accessToken;
    } catch (error) {
        console.error('Error generating admin token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function approve(id, accessToken) {
    try {
        const keycloakBaseUrl = 'https://keycloak-sit-vaps-sit.apps.nt-non-ocp.neotek.sa/admin/realms/master';
        console.log(accessToken)
        console.log(id)


        const keycloakAdminUrl = `${keycloakBaseUrl}/users/${id}`;

        const data = new URLSearchParams();
        data.append('enabled', 'true');
        const config = {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            httpsAgent: agent
        };

        const userData = {
            enabled: true
        };

        const response = await axios.put(keycloakAdminUrl, userData, config);

        console.log('User enabled successfully:', response.data);
    } catch (error) {
        console.error('Error User Enabled:', error.response ? error.response.data : error.message);
        throw error;
    }
}