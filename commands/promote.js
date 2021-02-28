"use strict"
const configUtils = require('../helper_services/config_helper')
const airtable = require('../helper_services/career_airtable_helper');

module.exports = {
    name: "promote",
    description: "Promote pilots who passed their rank. Specific to Jet Airways",
    async execute(message) {
        //Fetch all pilots records
        //Promote the deserving ones.
        //Push to airtable
        //Send a message to all those who were promoted
        let config = {
            api_key: "keyqib72M5UjMYPTj",
            base_id: "appsFcqOgZ3I3RahY",
            table_name: "Pilot Stats"
        }
        /* 
        Data required: Hours Flown, Rank, record_id
        Get list of ranks
        */
        let updatedCallsigns = [];
        let pilots = await airtable.fetchPilots(config);
        let promotionConfigs = await configUtils.loadJsonFile('./configs/promotion_configs.json');
        promotionConfigs = promotionConfigs.ranks;

        let rankHours = Object.keys(promotionConfigs);
        rankHours = rankHours.reverse();
        let updatedPilots = []
        let pilot, hour
        for (pilot of pilots) {
            let pilotHours = Math.floor(pilot.ft / 3600);
            for (hour of rankHours) {
                //Compare pilot hours based on ranks and check if they are correct or not
                if (pilotHours > parseInt(hour)) {
                    if (pilot.rank !== promotionConfigs[hour]) {
                        updatedPilots.push({
                            "id": pilot.id,
                            fields: {
                                "Rank": promotionConfigs[hour]
                            }
                        });
                        updatedCallsigns.push(pilot.callsign)
                    }
                    break;
                }
            }
        }
        try {
            await airtable.updateRank(config, updatedPilots);
            message.channel.send(`Congratulations to ${updatedCallsigns.join(', ')}! They have been promoted.`);
        }catch(e){
            message.channel.send(`Failed to update airtable. Pilots to be promoted are: ${updatedCallsigns.join(', ')}`)
        }
    }
}