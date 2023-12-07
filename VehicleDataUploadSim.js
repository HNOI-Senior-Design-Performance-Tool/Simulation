const axios = require("axios");

const ROOT = "http://localhost:8080/api/vehicleData";
const UPLOAD_ENDPOINT = `${ROOT}/uploadData`;
const BATCH_UPLOAD_ENDPOINT = `${ROOT}/uploadDataMany`;

const MPG_RANGE = [10, 15];
const CO_RANGE = [0, 100];
const NOx_RANGE = [0, 100];
const PARTICULATE_MATTER_RANGE = [0, 100];
const FUEL_LEVEL_RANGE = [0, 100];
const FLOWRATE_RANGE = [0, 100];

const DEFAULT_MAX_DEVIATION = 1;

const VEHICLES = [
	{
		vehicleName: "1983 Chrysler LeBaron",
		vehicleID: "ABC1234",
	},
	{
		vehicleName: "Saab 900 NG",
		vehicleID: "DEF5678",
	},
	{
		vehicleName: "1967 Pontiac GTO",
		vehicleID: "GHI9012",
	},
];

const randRange = (min, max) => {
	return Math.random() * (max - min) + min;
};

// Function for generating a random data point
const generateDataPoint = (vehicle) => {
	data = {
		vehicleName: vehicle.vehicleName,
		vehicleID: vehicle.vehicleID,
		mpg: randRange(...MPG_RANGE),
		CO: randRange(...CO_RANGE),
		NOx: randRange(...NOx_RANGE),
		particulateMatter: randRange(...PARTICULATE_MATTER_RANGE),
		fuelLevel: randRange(...FUEL_LEVEL_RANGE),
		flowrate: randRange(...FLOWRATE_RANGE),
		time: Date.now(),
	};

	return data;
};


// Function for generating a random data point from a previous data point
const generateDataPointFromPrevious = (previousDataPoint, maxDeviation) => {
	data = {
		vehicleName: previousDataPoint.vehicleName,
		vehicleID: previousDataPoint.vehicleID,
		CO: previousDataPoint.CO + randRange(-maxDeviation, maxDeviation),
		NOx: previousDataPoint.NOx + randRange(-maxDeviation, maxDeviation),
		particulateMatter: previousDataPoint.particulateMatter + randRange(-maxDeviation, maxDeviation),
		flowrate: previousDataPoint.flowrate + randRange(-maxDeviation, maxDeviation),
		fuelLevel: previousDataPoint.fuelLevel - randRange(0, 0.5),
		time: previousDataPoint.time + 1000,
	};

	return data;
};

// Function for uploading a single data point
const uploadDataPoint = async (dataPoint) => {
	try {
		const response = await axios.post(UPLOAD_ENDPOINT, dataPoint);
        return response.data;
	} catch (error) {
        console.log(error);
	}
};

// Clean up function
// Delete all data points in the vehicleData collection
const cleanUp = async () => {
	try {
		const response = await axios.delete(`${ROOT}/data`);
		console.log(response.data);
	} catch (error) {
		console.log(error);
	}
};

// Upload one random data point
const uploadOneRandom = async () => {
	const vehicle = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
	const dataPoint = generateDataPoint(vehicle);
	await uploadDataPoint(dataPoint);
};

// update aggregateData
const updateAggregateData = async () => {
	try {
		const response = await axios.post("http://localhost:8080/api/aggregateData/update");
		console.log(response.data);
	} catch (error) {
		console.log(error);
	}
};

// Simulation Function
// Upload a single random data point on a continuous interval
const liveDataSimulation = async (interval, maxDeviation) => {

    // keep a counter of the number of data points uploaded
    let count = 0;

	// keep a list of the previous data points for each vehicle
	const previousDataPoints = {};

	// store and upload an initial data point for each vehicle
	for (const vehicle of VEHICLES) {
		const dataPoint = generateDataPoint(vehicle);
		previousDataPoints[vehicle.vehicleID] = dataPoint;
		await uploadDataPoint(dataPoint);
	}

    const numVehicles = VEHICLES.length;

	// Loop forever
	while (true) {

		// Wait 1 second
		await new Promise((resolve) => setTimeout(resolve, interval));

		// Generate a random data point for each vehicle
		for (const vehicle of VEHICLES) {
			const dataPoint = generateDataPointFromPrevious(previousDataPoints[vehicle.vehicleID], maxDeviation);
			previousDataPoints[vehicle.vehicleID] = dataPoint;
			if (await uploadDataPoint(dataPoint))
                count++;
            

		}

        // Print the number of data points uploaded
        console.log(`Uploaded ${count} data points`);
	}
};

//uploadOneRandom();

liveDataSimulation(2000, DEFAULT_MAX_DEVIATION);

// cleanUp();

// updateAggregateData();
