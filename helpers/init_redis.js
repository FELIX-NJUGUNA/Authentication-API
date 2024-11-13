const redis = require('redis')

const client = redis.createClient({
 socket:{
        
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
})


client.on('connect', () => {
    console.log("Client connected to redis")
})


client.on('ready', () => {
    console.log("Client connected to redis and ready to use .....")
})


client.on('error', (err) => {
    console.log(err.message)
})

client.on('end', () => {
    console.log("Client is disconnected from redis")
})

process.on('SIGINT', () =>{
    client.quit()
})

async function testConnection() {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
}

testConnection();

module.exports = client;