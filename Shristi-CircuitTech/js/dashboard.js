// =========================================================
// Circuit Tech - Dashboard
// ThingSpeak + Firebase + Chart.js
// =========================================================

import {
    watchAuth,
    logoutUser
} from "./auth.js";


// =========================================================
// THINGSPEAK CONFIGURATION
// =========================================================

const THINGSPEAK_CHANNEL_ID = "3530682";

const THINGSPEAK_READ_API_KEY =
    "Y0XH5O82MY1M63JB";


// =========================================================
// SENSOR FIELD MAPPING
// =========================================================
//
// ThingSpeak:
// Field 1 = Temperature
// Field 2 = Humidity
// Field 3 = Soil Moisture
//
// =========================================================

const SENSOR_FIELDS = {

    temperature: "field1",

    humidity: "field2",

    soilMoisture: "field3"

};


// =========================================================
// SETTINGS
// =========================================================

let charts = {};

let currentLimit = 20;

let refreshTimer = null;


// =========================================================
// DOM ELEMENTS
// =========================================================

const temperatureValue =
    document.getElementById(
        "temperatureValue"
    );

const humidityValue =
    document.getElementById(
        "humidityValue"
    );

const soilMoistureValue =
    document.getElementById(
        "soilMoistureValue"
    );


const lastUpdated =
    document.getElementById(
        "lastUpdated"
    );

const connectionStatus =
    document.getElementById(
        "connectionStatus"
    );

const timeRange =
    document.getElementById(
        "timeRange"
    );

const refreshButton =
    document.getElementById(
        "refreshButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );

const sidebar =
    document.getElementById(
        "sidebar"
    );


logoutButton.addEventListener(
    "click",
    async () => {

        logoutButton.disabled = true;

        try {

            await logoutUser();

            window.location.replace(
                "index.html"
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            logoutButton.disabled = false;

            window.alert(
                "Unable to log out. Please check your connection and try again."
            );

        }

    }
);


// =========================================================
// AUTHENTICATION
// =========================================================

watchAuth((user) => {

    if (!user) {

        window.location.href =
            "index.html";

        return;

    }


    updateUserInfo(user);

    loadThingSpeakData();

});


// =========================================================
// USER INFORMATION
// =========================================================

function updateUserInfo(user) {

    const userEmail =
        document.getElementById(
            "userEmail"
        );

    const userName =
        document.getElementById(
            "userName"
        );

    const userAvatar =
        document.getElementById(
            "userAvatar"
        );


    const email =
        user.email || "User";


    userEmail.textContent =
        email;


    const name =
        email.split("@")[0];


    userName.textContent =
        name;


    userAvatar.textContent =
        name
            .charAt(0)
            .toUpperCase();

}


// =========================================================
// THINGSPEAK URL
// =========================================================

function getThingSpeakURL() {

    let url =
        `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?results=${currentLimit}`;


    if (THINGSPEAK_READ_API_KEY) {

        url +=
            `&api_key=${THINGSPEAK_READ_API_KEY}`;

    }


    return url;

}


// =========================================================
// FETCH THINGSPEAK DATA
// =========================================================

async function fetchThingSpeakData() {

    const response =
        await fetch(
            getThingSpeakURL()
        );


    if (!response.ok) {

        throw new Error(
            "ThingSpeak request failed."
        );

    }


    const data =
        await response.json();


    return data.feeds || [];

}


// =========================================================
// LOAD DATA
// =========================================================

async function loadThingSpeakData() {

    try {

        connectionStatus.textContent =
            "Connecting...";


        connectionStatus.classList.remove(
            "offline"
        );


        const feeds =
            await fetchThingSpeakData();


        if (!feeds.length) {

            throw new Error(
                "No sensor data available."
            );

        }


        processSensorData(feeds);


        connectionStatus.textContent =
            "Connected";


        connectionStatus.classList.add(
            "online"
        );


        lastUpdated.textContent =
            `Updated ${new Date().toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )}`;


    } catch (error) {

        console.error(
            "ThingSpeak error:",
            error
        );


        connectionStatus.textContent =
            "Connection failed";


        connectionStatus.classList.remove(
            "online"
        );


        connectionStatus.classList.add(
            "offline"
        );


        lastUpdated.textContent =
            "Unable to update";

    }

}


// =========================================================
// PROCESS SENSOR DATA
// =========================================================

function processSensorData(feeds) {

    const labels =
        feeds.map(
            (feed) =>
                formatDate(
                    feed.created_at
                )
        );


    const temperature =
        feeds.map(
            (feed) =>
                parseNumber(
                    feed[
                        SENSOR_FIELDS.temperature
                    ]
                )
        );


    const humidity =
        feeds.map(
            (feed) =>
                parseNumber(
                    feed[
                        SENSOR_FIELDS.humidity
                    ]
                )
        );


    const soilMoisture =
        feeds.map(
            (feed) =>
                parseNumber(
                    feed[
                        SENSOR_FIELDS.soilMoisture
                    ]
                )
        );


    const latest =
        feeds[
            feeds.length - 1
        ];


    updateMetricCards(
        latest
    );


    updateCharts(
        labels,
        temperature,
        humidity,
        soilMoisture
    );

}


// =========================================================
// PARSE NUMBER
// =========================================================

function parseNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : null;

}


// =========================================================
// UPDATE METRIC CARDS
// =========================================================

function updateMetricCards(feed) {

    const temperature =
        parseNumber(
            feed[
                SENSOR_FIELDS.temperature
            ]
        );


    const humidity =
        parseNumber(
            feed[
                SENSOR_FIELDS.humidity
            ]
        );


    const soilMoisture =
        parseNumber(
            feed[
                SENSOR_FIELDS.soilMoisture
            ]
        );


    // -----------------------------------------------------
    // TEMPERATURE
    // -----------------------------------------------------

    temperatureValue.textContent =
        temperature !== null
            ? `${temperature.toFixed(1)} °C`
            : "-- °C";


    // -----------------------------------------------------
    // HUMIDITY
    // -----------------------------------------------------

    humidityValue.textContent =
        humidity !== null
            ? `${humidity.toFixed(1)} %`
            : "-- %";


    // -----------------------------------------------------
    // SOIL MOISTURE
    // -----------------------------------------------------

    soilMoistureValue.textContent =
        soilMoisture !== null
            ? `${soilMoisture.toFixed(1)} %`
            : "-- %";

}


// =========================================================
// UPDATE CHARTS
// =========================================================

function updateCharts(
    labels,
    temperature,
    humidity,
    soilMoisture
) {

    createOrUpdateChart(
        "temperature",
        "temperatureChart",
        labels,
        temperature,
        "#55d6a5",
        "Temperature",
        "°C"
    );


    createOrUpdateChart(
        "humidity",
        "humidityChart",
        labels,
        humidity,
        "#9d8cff",
        "Humidity",
        "%"
    );


    createOrUpdateChart(
        "soilMoisture",
        "soilMoistureChart",
        labels,
        soilMoisture,
        "#d9903f",
        "Soil Moisture",
        "%"
    );

}


// =========================================================
// CREATE / UPDATE CHART
// =========================================================

function createOrUpdateChart(
    chartName,
    canvasId,
    labels,
    values,
    color,
    label,
    unit
) {

    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        console.warn(
            `Canvas #${canvasId} was not found.`
        );

        return;

    }


    const ctx =
        canvas.getContext("2d");


    // -----------------------------------------------------
    // UPDATE EXISTING CHART
    // -----------------------------------------------------

    if (charts[chartName]) {

        charts[chartName].data.labels =
            labels;


        charts[chartName]
            .data
            .datasets[0]
            .data =
                values;


        charts[chartName].update(
            "none"
        );


        return;

    }


    // =====================================================
    // GRADIENT
    // =====================================================

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            240
        );


    gradient.addColorStop(
        0,
        hexToRGBA(
            color,
            0.22
        )
    );


    gradient.addColorStop(
        0.65,
        hexToRGBA(
            color,
            0.04
        )
    );


    gradient.addColorStop(
        1,
        hexToRGBA(
            color,
            0
        )
    );


    // =====================================================
    // CREATE CHART
    // =====================================================

    charts[chartName] =
        new Chart(
            ctx,
            {

                type: "line",


                data: {

                    labels: labels,


                    datasets: [

                        {

                            label: label,

                            data: values,

                            borderColor:
                                color,

                            backgroundColor:
                                gradient,

                            borderWidth: 2,

                            fill: true,

                            tension: 0.4,

                            pointRadius: 2,

                            pointHoverRadius: 5,

                            pointBackgroundColor:
                                color,

                            pointBorderColor:
                                color,

                            pointHoverBackgroundColor:
                                color,

                            pointHoverBorderColor:
                                "#080a0c",

                            pointHoverBorderWidth:
                                2

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    interaction: {

                        intersect: false,

                        mode: "index"

                    },


                    plugins: {

                        legend: {

                            display: false

                        },


                        tooltip: {

                            displayColors: false,

                            backgroundColor:
                                "#101419",

                            borderColor:
                                "rgba(255,255,255,0.08)",

                            borderWidth: 1,

                            titleColor:
                                "#d9dde2",

                            bodyColor:
                                "#aeb4bb",

                            titleFont: {

                                size: 10,

                                weight: "600"

                            },

                            bodyFont: {

                                size: 10

                            },

                            padding: 10,

                            cornerRadius: 7,


                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const value =
                                            context.parsed.y;


                                        return `${label}: ${value} ${unit}`;

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            border: {

                                display: false

                            },


                            grid: {

                                display: false

                            },


                            ticks: {

                                color:
                                    "#59616a",

                                font: {

                                    size: 9

                                },

                                maxTicksLimit:
                                    7,

                                maxRotation: 0

                            }

                        },


                        y: {

                            border: {

                                display: false

                            },


                            grid: {

                                color:
                                    "rgba(255,255,255,0.035)",

                                drawTicks: false

                            },


                            ticks: {

                                color:
                                    "#59616a",

                                font: {

                                    size: 9

                                },

                                padding: 7,

                                maxTicksLimit:
                                    5,


                                callback:
                                    function (
                                        value
                                    ) {

                                        return `${value}${unit}`;

                                    }

                            }

                        }

                    },


                    animation: {

                        duration: 700,

                        easing:
                            "easeOutQuart"

                    }

                }

            }
        );

}


// =========================================================
// HEX → RGBA
// =========================================================

function hexToRGBA(
    hex,
    alpha
) {

    const clean =
        hex.replace(
            "#",
            ""
        );


    const r =
        parseInt(
            clean.substring(
                0,
                2
            ),
            16
        );


    const g =
        parseInt(
            clean.substring(
                2,
                4
            ),
            16
        );


    const b =
        parseInt(
            clean.substring(
                4,
                6
            ),
            16
        );


    return `rgba(${r}, ${g}, ${b}, ${alpha})`;

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            dateString
        );


    return date.toLocaleTimeString(
        [],
        {

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}


// =========================================================
// REFRESH BUTTON
// =========================================================

refreshButton.addEventListener(
    "click",
    async () => {

        refreshButton.classList.add(
            "rotating"
        );


        await loadThingSpeakData();


        setTimeout(
            () => {

                refreshButton.classList.remove(
                    "rotating"
                );

            },
            500
        );

    }
);


// =========================================================
// TIME RANGE
// =========================================================

timeRange.addEventListener(
    "change",
    async () => {

        currentLimit =
            Number(
                timeRange.value
            );


        await loadThingSpeakData();

    }
);


// =========================================================
// AUTO REFRESH
// =========================================================

function startAutoRefresh() {

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        );

    }


    refreshTimer =
        setInterval(
            () => {

                loadThingSpeakData();

            },
            30000
        );

}


startAutoRefresh();


// =========================================================
// MOBILE SIDEBAR
// =========================================================

mobileMenu.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);