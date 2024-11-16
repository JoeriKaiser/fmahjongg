// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

#[derive(Serialize, Deserialize, Debug)]
pub struct Score {
    id: Option<i64>,
    name: String,
    time: f64,
    timestamp: i64,
}

struct DbConnection(Mutex<Connection>);

fn init_db(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        time REAL NOT NULL,
        timestamp INTEGER NOT NULL)",
        [],
    )?;
    Ok(())
}

#[tauri::command]
async fn add_score(db: State<'_, DbConnection>, name: String, time: f64) -> Result<Score, String> {
    let conn = db.0.lock().unwrap();
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    conn.execute(
        "INSERT INTO scores (name, time, timestamp) VALUES (?1, ?2, ?3)",
        params![name, time, timestamp],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid() as i64;

    Ok(Score {
        id: Some(id),
        name,
        time,
        timestamp,
    })
}

#[tauri::command]
async fn get_top_scores(db: State<'_, DbConnection>, limit: i64) -> Result<Vec<Score>, String> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT * FROM scores ORDER BY time ASC LIMIT ?1")
        .map_err(|e| e.to_string())?;

    let scores = stmt
        .query_map(params![limit], |row| {
            Ok(Score {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                time: row.get(2)?,
                timestamp: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(scores)
}

fn main() {
    let conn = Connection::open("scores.db").unwrap();
    init_db(&conn).unwrap();

    tauri::Builder::default()
        .manage(DbConnection(Mutex::new(conn)))
        .invoke_handler(tauri::generate_handler![add_score, get_top_scores])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    fmahjongg_lib::run();
}
