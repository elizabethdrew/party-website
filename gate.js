(() => {
  // ---- CONFIG ----
  // Change this to your chosen password
  const PARTY_PASSWORD = "PARTY";

  // Stores unlocked state for this browser tab/session
  const KEY = "partyInviteUnlocked";

  const gate = document.getElementById("gate");
  const invite = document.getElementById("inviteContent");
  const form = document.getElementById("gateForm");
  const input = document.getElementById("password");
  const error = document.getElementById("gateError");

  if (!gate || !invite || !form || !input) return;

  function unlock() {
    sessionStorage.setItem(KEY, "true");
    gate.style.display = "none";
    invite.style.display = "block";
  }

  // If already unlocked this session, skip gate
  if (sessionStorage.getItem(KEY) === "true") {
    unlock();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.textContent = "";

    const entered = input.value || "";
    if (entered === PARTY_PASSWORD) {
      unlock();
    } else {
      error.textContent = "Nope — try again.";
      input.value = "";
      input.focus();
    }
  });
})();
