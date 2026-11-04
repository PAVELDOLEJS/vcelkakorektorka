/* Společné sdílení traktátů – Včelka korektorka.
   Funguje na stránkách s #traktat-share a #share-traktat.
   Při dostupnosti Web Share API otevře nabídku sdílení;
   jinak nabídne zkopírování odkazu. Bez knihoven. */
(() => {
  "use strict";

  function initShare() {
    const container = document.getElementById("traktat-share");
    const button = document.getElementById("share-traktat");
    if (!container || !button) return;

    const canonical = document.querySelector('link[rel="canonical"]');
    const url = canonical?.href || window.location.href.split("#")[0];
    const title = document.querySelector('meta[property="og:title"]')?.content
      || document.title;
    const shareData = {
      title,
      text: "Petr Chelčický v jazyce 21. století",
      url,
    };

    const nativeShare = typeof navigator.share === "function"
      && (typeof navigator.canShare !== "function" || navigator.canShare(shareData));

    button.setAttribute("aria-label", nativeShare ? "Sdílet traktát" : "Zkopírovat odkaz na traktát");
    button.title = nativeShare ? "Sdílet traktát" : "Zkopírovat odkaz na traktát";

    // Zpráva pro čtečky obrazovky; vzhled určuje společná třída .visually-hidden.
    const status = document.createElement("span");
    status.className = "visually-hidden";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    container.appendChild(status);

    container.hidden = false;

    button.addEventListener("click", async () => {
      if (button.disabled) return;
      button.disabled = true;

      try {
        if (nativeShare) {
          try {
            await navigator.share(shareData);
            return;
          } catch (error) {
            if (error?.name === "AbortError") return; // Čtenář nabídku zavřel.
            // Pokud systémové sdílení selže, nabídneme kopírování odkazu.
          }
        }

        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(url);
            status.textContent = "Odkaz na traktát byl zkopírován.";
            return;
          } catch (error) {
            // Starší nebo omezené prohlížeče: použijeme dialog s adresou.
          }
        }
        window.prompt("Zkopírujte odkaz na traktát:", url);
        status.textContent = "Odkaz na traktát je připraven ke zkopírování.";
      } finally {
        button.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShare, { once: true });
  } else {
    initShare();
  }
})();
