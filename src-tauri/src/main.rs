#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

#[tauri::command]
fn execute_action(target: String) -> Result<(), String> {
    match open::that(&target) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to open: {target}. Error: {e}")),
    }
}

fn main() {
    // L'identifiant doit correspondre EXACTEMENT à celui de tauri.conf.json
    const BUNDLE_IDENTIFIER: &str = "com.cogniflow.professional";

    tauri::Builder::default()
        .setup(|app| {
            // On prépare le plugin avec l'identifiant de notre application
            tauri_plugin_deep_link::prepare(BUNDLE_IDENTIFIER);

            let handle = app.handle().clone();
            tauri_plugin_deep_link::register(
                "cogniflow", // Le nom de notre protocole (ex: cogniflow://)
                move |request| {
                    // Quand un lien est reçu, on envoie un événement au frontend
                    // C'est le pont entre le backend et le frontend
                    handle.emit_all("deep-link-received", request).unwrap();
                },
            )
            .unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![execute_action])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
