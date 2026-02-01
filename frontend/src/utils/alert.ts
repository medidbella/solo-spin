export function showAlert(message: string, type: "error" | "success" = "error") {
    //removing existing alert
    const existingAlert = document.getElementById("custom-alert");
    if (existingAlert)
        existingAlert.remove();
    //create alert container (div)
    const alert = document.createElement("div");
    alert.id = "custom-alert";
    alert.innerHTML = 
    `
    <div class="fixed top-10 right-10 z-100">
        <div class="animate-fade-in-down bg ${
            type === "error" ? "bg-redRemove/50" : "bg-greenAdd/50"
        } text-white rounded-xl px-8 py-2 md:px-12 md:py-4 text-center ${
            type === "error" 
                ? "shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                : "shadow-[0_0_15px_rgba(34,197,94,0.5)]"
        }">
            <p class="font-normal text-[12px] md:text-[17px] font-roboto"><span class="font-roboto font-bold text-[17px] md:text-[20px] mb-2 ">${type === "error" ? "Error" : "Success"}: </span>
                ${message}
            </p>
        </div>
    </div>
    `;
    document.body.appendChild(alert)

    //auto remove after 3s
    setTimeout(() => alert.remove(), 2000);
}