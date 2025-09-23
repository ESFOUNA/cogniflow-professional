#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]
  
  // On importe la caisse (crate) 'open' qui sait comment ouvrir des choses
  // sur différents systèmes d'exploitation.
  use open;
  
  #[tauri::command]
  // Notre fonction qui sera appelée depuis le JavaScript.
  // Elle prend une 'cible' (target) en argument (ex: une URL ou un chemin de fichier).
  fn execute_action(target: String) -> Result<(), String> {
    // open::that() est la fonction magique qui ouvre la cible.
    match open::that(&target) {
      Ok(_) => {
        // Si tout va bien, on ne renvoie rien.
        println!("Successfully opened: {}", target);
        Ok(())
      },
      Err(e) => {
        // Si ça échoue, on renvoie une erreur sous forme de String.
        println!("Failed to open target '{}': {}", target, e);
        Err(format!("Failed to open: {}. Error: {}", target, e))
      }
    }
  }
  
  fn main() {
      tauri::Builder::default()
          // On déclare notre fonction pour que le frontend puisse l'appeler.
          .invoke_handler(tauri::generate_handler![execute_action])
          .run(tauri::generate_context!())
          .expect("error while running tauri application");
  }