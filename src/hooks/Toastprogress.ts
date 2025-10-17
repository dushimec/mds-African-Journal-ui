import toast from "react-hot-toast";

// 🔹 Attach progress bar to the toast container
function attachProgressBar(id: string, duration: number, color: string) {
  const start = Date.now();

  const interval = setInterval(() => {
    const elapsed = Date.now() - start;
    const percent = Math.min((elapsed / duration) * 100, 100);

    const toastEl = document.querySelector(`[data-toast-id="${id}"]`);
    if (!toastEl) return;

    // Create progress bar if not exists
    let bar = toastEl.querySelector(".progress-bar") as HTMLElement | null;
    if (!bar) {
      bar = document.createElement("div");
      bar.classList.add("progress-bar");
      bar.style.background = color;
      toastEl.appendChild(bar);
    }

    // Update progress width
    bar.style.width = `${100 - percent}%`;

    if (percent >= 100) clearInterval(interval);
  }, 100);
}

// 🔹 Override default toast.success and toast.error
const originalSuccess = toast.success;
const originalError = toast.error;

toast.success = (message: string, options?: any) => {
  const id = originalSuccess(message, {
    style: {
      background: "#fff",
      color: "#000",
      border: "1px solid #ccc",
      position: "relative",
    },
    icon: "✅",
    ...options,
  }) as string;

  attachProgressBar(id, options?.duration || 5000, "#22c55e"); // green
  return id;
};

toast.error = (message: string, options?: any) => {
  const id = originalError(message, {
    style: {
      background: "#fff",
      color: "#000",
      border: "1px solid #ccc",
      position: "relative",
    },
    icon: "❌",
    ...options,
  }) as string;

  attachProgressBar(id, options?.duration || 5000, "#ef4444"); // red
  return id;
};

export default toast;
