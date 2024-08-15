window.android = {
    finish: function() {
        prompt("#finish", "");
    },
    reload: function() {
        prompt("#reload", "");
    },
    toast: function(text) {
        prompt("#toast", text);
    },
    vibrate: function(time) {
        prompt("#vibrate", time);
    },
    changeBrightness: function(brightness) {
        prompt("#change_brightness", brightness);
    },
    reCreate: function(){
        prompt("#recreate", "");
    },
    getBrightness: function() {
        return prompt("#get_brightness", "");
    },
    open: function(pkg) {
        prompt("#open_app", pkg);
    },
    install: function(path) {
        prompt("#install_app", path);
    },
    uninstall: function(pkg) {
        prompt("#uninstall_app", pkg);
    },
    setData: function(key, value) {
        prompt("#set_data", key + "#" + value);
    },
    getData: function(key, defaultValue) {
        return prompt("#get_data", key + "#" + defaultValue);
    },
    removeData: function(key) {
        prompt("#remove_data", key);
    },
    clearData: function() {
        prompt("#clear_data", "");
    },
    getCopyedText: function() {
        return prompt("#get_copy", "");
    },
    setCopyText: function(text) {
        prompt("#set_copy", text);
    },
    createFolder: function(path) {
        prompt("#make_path", path);
    },
    deletePath: function(path) {
        prompt("#delete_path", path);
    },
    copyPath: function(source, dest) {
        prompt("#copy_path", source + "#" + dest);
    },
    copyAssetFolder: function(source, dest) {
        prompt("#copy_asset_folder", source + "#" + dest);
    },
    movePath: function(source, dest) {
        prompt("#move_path", source + "#" + dest);
    },
    writeFile: function(path, data) {
        prompt("#write_file", path + "#__#___#__#" + data);
    },
    readFile: function(path) {
        return prompt("#read_file", path);
    },
    moveFile: function(source, dest) {
        prompt("#move_file", source + "#" + dest);
    },
    copyFile: function(source, dest) {
        prompt("#copy_file", source + "#" + dest);
    },
    copyAssetFile: function(source, dest) {
        prompt("#copy_asset_file", source + "#" + dest);
    },
    renamePath: function(path, name) {
        prompt("#rename", path + "#" + name);
    },
    isFile: function(path) {
        return prompt("#is_file", path);
    },
    isFolder: function(path) {
        return prompt("#is_folder", path);
    },
    isPath: function(path) {
        return prompt("#is_file_exist", path);
    },
    getFileSize: function(path) {
        return prompt("#get_file_size", path);
    },
    getFileLength: function(path) {
        return prompt("#get_file_length", path);
    },
    getFileLastModified: function(path) {
        return prompt("#get_file_last_modified", path);
    },
    getFileLastModifiedTime: function(path, format) {
        return prompt("#get_file_time", path + "#" + format);
    },
    getPath: function(path) {
        return prompt("#get_files_folders", path);
    },
    getFiles: function(path) {
        return prompt("#get_files", path)
    },
    getFolders: function(path) {
        return prompt("#get_folders", path);
    },
    getStorages: function() {
        return prompt("#get_storages", "");
    },
    importPDF: function() {
        if(android.checkPermission() == "true"){
            prompt("#import_pdf", "");
        }
    },
    importImgs: function() {
        if(android.checkPermission() == "true"){
            prompt("#import_img", "");
        }
    },
    pdfToText: function(start,end) {
        prompt("#pdf_to_text",start + "#" + end);
    },
    facebook: function() {
        prompt("#facebook", "");
    },
    youtube: function() {
        prompt("#youtube", "")
    },
    update: function() {
        prompt("#update", "")
    },
    rate: function() {
        prompt("#rate", "")
    },
    share: function() {
        prompt("#share", "")
    },
    feedback: function() {
        prompt("#feedback", "")
    },
    speakStart:function(text){
        prompt("#start_speak",text);
    },
    speakStop:function(){
        prompt("#stop_speak","");
    },
    isSpeaking:function(){
        return prompt("#is_speaking","");
    },
    speakSpeed: function(speed) {
        prompt("#speak_speed", speed);
    },
    setVolume:function(volume){
        prompt("#sound_volume",volume);
    },
    setFullscreen:function(bool){
        prompt("#set_fullscreen",bool);
    },
    checkPermission:function(){
        return prompt("#checkPermission","");
    },
    openPaymentDialog: function(){
        prompt("#open_payment_dialog","");
    }
};