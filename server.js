const express = require('express');
const cors = require('cors');
const BambuLabAPI = require('./bambuAPI');
const GitHubFileUpdater = require('./githubAPI');

const app = express();
const port = process.env.PORT || 8080;

const corsOptions = {
    origin: [
        "https://port-0-user-bambulab-firmware-backend-5b8v2nlsa3msrp.sel5.cloudtype.app/",
        "https://web-user-bambulab-firmware-frontend-5b8v2nlsa3msrp.sel5.cloudtype.app/",
        "http://localhost:8080",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

app.post("/api/bambulab/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const response = await BambuLabAPI.login(username, password);
        res.json(response);
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/bambulab/device-version", async (req, res) => {
    const { printerSerial, accessToken } = req.body;

    try {
        const response = await BambuLabAPI.getDeviceVersion(printerSerial, accessToken);
        res.json(response);
    } catch (error) {
        console.error("Error fetching device version:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/github/update-file", async (req, res) => {
    const { printerSerial, currentVersion } = req.body;

    const _ = {
        '01S': 'P1P', '01P': 'P1S', '030': 'A1_MINI', '039': 'A1', '00W': 'X1', '00M': 'X1C'
    }[printerSerial.substring(0, 3)];

    try {
        const response = await GitHubFileUpdater.updateFile(_, currentVersion);
        res.json(response);
    } catch (error) {
        console.error("Error fetching update file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
