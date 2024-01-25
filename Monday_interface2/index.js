'use strict';
// import fetch from 'node-fetch';
const pgdatabase = require('./databasepg')
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express().use(bodyParser.json()); // creates http server
const port = 3000;
const mondayToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI4MTYxMDEwNSwiYWFpIjoxMSwidWlkIjoyODkyMTkxMiwiaWFkIjoiMjAyMy0wOS0xM1QxNTo1NzowMC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTA2NTgzOTIsInJnbiI6InVzZTEifQ.dpP6NitDswhtTvGu7T4YNucONQtJH7HbbZzcwqr0PVU'; // type here your verification token
const devopsToken = '63jze6niiv34ukrbicrly3fiusco3kf3pwpykjrz6z2tbomymmfq';


//
// Define your OAuth 2.0 configuration
const oauthConfig = {
    clientId: '5def0198a310111c536a4d654c486c7f',
    clientSecret: 'd317d4f45b24dd3f8d0e0f7a15c70671',
    redirectUri: 'http://localhost:3000/callback', // The callback URL you've registered
    authorizationUrl: 'https://auth.monday.com/oauth2/authorize?client_id=5def0198a310111c536a4d654c486c7f',
    tokenUrl: 'TOKEN_URL',
    appId: '10101052',
  };
//
// "name": "GTec",
// const mondayBoardId = '3818555982';
const mondayBoardId = '';
//


// Monday.com API and Azure DevOps API endpoints and authentication tokens
const mondayAPIKey = mondayToken;
//const azureDevOpsPAT = devopsToken;

// Define the Monday.com board and Azure DevOps project details
//const azureDevOpsProject = 'G-Tec';
//const azureDevOpsWorkItemTypeName = 'Task';

// Function to create a new work item in Azure DevOps
async function createWorkItemInAzureDevOps(title, description) {
  try {
    const url = `https://dev.azure.com/${azureDevOpsProject}/_apis/wit/workitems/$${azureDevOpsWorkItemTypeName}?api-version=6.0`;

    const headers = {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Basic ${Buffer.from(`:${azureDevOpsPAT}`).toString('base64')}`,
    };

    const data = [
      {
        op: 'add',
        path: '/fields/System.Title',
        value: title,
      },
      {
        op: 'add',
        path: '/fields/System.Description',
        value: description,
      },
    ];

    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error creating work item in Azure DevOps:', error);
    throw error;
  }
}

// Function to retrieve items from a Monday.com board
//
async function getItemsFromMonday() {
  try {
    let allItems = [];
    let page = 1;
    const perPage = 100;
    const body = {
      query: `
    boards(workspace_ids: 3759369) {
    name
    id #use this id for postrgres id
 
  
    items_page{
      
      items {
        group{
          title
        }
        
        name
        updated_at
        id # use this for 2nd part of unique key
        
        updates{
          text_body
          created_at

          creator{
            name
          }
          # replies{
          #   text_body
          #   creator{
          #     name
          #   }
          # }
        }
        
        column_values (ids: ["text7", "date4",
          "status39", "text", "status", "status3"
          , "status8", "numbers14"]){
          text 
          type
        }
        
      }
    }
  }
`,


      variables: {
        boardId: `${mondayBoardId}`,
      groupId: "topics",
      columnValues: JSON.stringify({ status: { index: 1 } })
      }
    }
    
    while (true){
      const url = `https://api.monday.com/v2`;

      const headers = {
        Authorization: `${mondayAPIKey}`,
      };
      const params = {
        limit: perPage,
        page,
      }

      const response = await axios.post(url, { headers, params, body });
      console.log(response);

      if (response.status === 200 && response.data.data.length > 0) {
        allItems = allItems.concat(response.data.data);
        page++;
        console.log("success");
      } else {
        console.error('Error fetching items from Monday.com:', response.data);
        throw new Error('Error fetching items from Monday.com');
      }
      return allItems;

  }
  } catch (error) {
    console.log('error');
    console.error('Error fetching items from Monday.com:', error);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    console.log('main function');
    const mondayItems = await getItemsFromMonday();
    console.log('Items from Manday.com:', mondayItems);
    // Assuming you want to create work items in Azure DevOps based on Monday.com items
    // for (const mondayItem of mondayItems.data) {
    //   const title = mondayItem.name;
    //   const description = mondayItem.column_values.find((col) => col.title === 'Description').text;

    //   // Create work item in Azure DevOps
    //   //const azureDevOpsWorkItem = await createWorkItemInAzureDevOps(title, description);
    //   //console.log('Created work item in Azure DevOps:', azureDevOpsWorkItem);
    // }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
