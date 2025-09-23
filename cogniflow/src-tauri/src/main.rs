#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]
  
  use open;
  
  #[tauri::command]
  fn execute_action(target: String) -> Result<(), String> {
    match open::that(&target) {
      Ok(_) => {
        println!("Successfully opened: {}", target);
        Ok(())
      },
      Err(e) => {
        println!("Failed to open target '{}': {}", target, e);
        Err(format!("Failed to open: {}. Error: {}", target, e))
      }
    }
  }
  
  fn main() {
      tauri::Builder::default()
          .invoke_handler(tauri::generate_handler![execute_action])
          .run(tauri::generate_context!())
          .expect("error while running tauri application");
  }