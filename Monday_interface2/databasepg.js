require('dotenv').config();
const { Client } = require('pg');
const config = require('./config')

const connectionConfig = {
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,


   port: process.env.DB_PORT,
};
async function insertMondayData(apiResponse) {
   const client = new Client(connectionConfig);

   try {
      await client.connect();

      for (const boardData of apiResponse.data.boards) {
         const boardInsertQuery = 'INSERT INTO board(board_id, name) VALUES($1, $2) ON CONFLICT (board_id) DO NOTHING';
         await client.query(boardInsertQuery, [boardData.id, boardData.name]);

         for (const item of boardData.items) {
            console.log(item);

            const rowInsertQuery = 'INSERT INTO rows(api_id, group_name, task_name, updated_at, other_columns, board_id) VALUES($1, $2, $3, $4, $5, $6) ON CONFLICT (api_id) DO NOTHING';
            await client.query(rowInsertQuery, [item.id, item.group.title, item.name, item.updated_at, JSON.stringify(item.column_values), boardData.id]);

            for (const update of item.updates) {
               const updateInsertQuery = 'INSERT INTO task_updates(text_body, created_at, creator, row_id) VALUES($1, $2, $3, $4)';
               await client.query(updateInsertQuery, [update.text_body, update.created_at, update.creator.name, item.id]);
            }
         }



      console.log('Tables created and data inserted successfully.');
      }
   } catch (err) {
      console.error('Error creating tables and inserting data:', err);
   } finally {
      await client.end();
   }
}
//graph ql
let query = `query {
  boards(workspace_ids: 3759369) {
    name
    id # use this id for postgres id

    items {
        group {
          title
        }
        name
        updated_at
        id # use this for 2nd part of unique key

        updates {
          text_body
          created_at

          creator {
            name
          }

          # replies{
          #   text_body
          #   creator{
          #     name
          #   }
          # }
        }

        column_values(ids: ["text7", "date4",
          "status39", "text", "status", "status3"
          , "status8", "numbers14"]) {
          text
          type
        }
      }
    }
}`;

fetch ("https://api.monday.com/v2", {
   method: 'POST',
   headers: {
      'Content-Type': 'application/json',
      'Authorization' : config.Authorization
   },
   body: JSON.stringify({
      'query' : query
   })
})
   .then(res => res.json())
   .then(res => {
      insertMondayData(res)
   });








