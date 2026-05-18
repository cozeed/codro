use std::io::{Read, Write};
use std::net::TcpListener;
use std::sync::Mutex;

use tauri::webview::{DownloadEvent, WebviewWindowBuilder};

static OAUTH_TOKEN: Mutex<Option<String>> = Mutex::new(None);

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn start_oauth_server() -> Result<u16, String> {
    let listener = TcpListener::bind("127.0.0.1:0").map_err(|e| e.to_string())?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();

    std::thread::spawn(move || {
        if let Ok((mut stream, _)) = listener.accept() {
            let mut buf = [0u8; 4096];
            let _ = stream.read(&mut buf);
            let request = String::from_utf8_lossy(&buf);

            let token = request
                .lines()
                .next()
                .and_then(|line| line.split_whitespace().nth(1))
                .and_then(|path| path.strip_prefix("/?token="))
                .map(|t| t.to_string());

            let body = if token.is_some() {
                "<html><head><style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#e5e7eb;background:#1a1a2e}h2{font-size:1.5rem;margin-bottom:.5rem}p{color:#9ca3af}</style></head><body><h2>Codro,Login successful!</h2><p>You may close this window and return to the app.</p></body></html>"
            } else {
                "<html><head><style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#e5e7eb;background:#1a1a2e}h2{font-size:1.5rem;margin-bottom:.5rem}p{color:#9ca3af}</style></head><body><h2>Codro,Login failed</h2></body></html>"
            };
            let response = format!(
                "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\nContent-Length: {}\r\n\r\n{}",
                body.len(),
                body
            );
            let _ = stream.write_all(response.as_bytes());

            if let Some(token) = token {
                *OAUTH_TOKEN.lock().unwrap() = Some(token);
            }
        }
    });

    Ok(port)
}

#[tauri::command]
fn take_oauth_token() -> Option<String> {
    OAUTH_TOKEN.lock().unwrap().take()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![greet, start_oauth_server, take_oauth_token])
        .setup(|app| {
            let handle = app.handle();
            let _window = WebviewWindowBuilder::from_config(handle, &app.config().app.windows[0])?
                .on_download(|_webview, event| {
                    match event {
                        DownloadEvent::Requested { url, destination } => {
                            let default_name = destination
                                .file_name()
                                .and_then(|n| n.to_str())
                                .or_else(|| url.path_segments().and_then(|s| s.last()))
                                .unwrap_or("download");
                            let ext = std::path::Path::new(default_name)
                                .extension()
                                .and_then(|e| e.to_str())
                                .unwrap_or("");
                            let mut dialog = rfd::FileDialog::new()
                                .set_file_name(default_name);
                            if !ext.is_empty() {
                                dialog = dialog.add_filter(
                                    &format!("{} (*.{})", ext.to_uppercase(), ext),
                                    &[ext],
                                );
                            }
                            if let Some(path) = dialog.save_file() {
                                *destination = path;
                                true
                            } else {
                                false
                            }
                        }
                        DownloadEvent::Finished { .. } => true,
                        _ => true,
                    }
                })
                .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
