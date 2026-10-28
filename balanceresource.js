
(async () => {
    // ====================================
    // KLANLAR - OTOMATİK MESAJ GÖNDERME
    // ====================================

    // MESAJ BİLGİLERİ
    const alici = "";
    const konu = "Merhaba";
    const icerik = "Selam";

    try {
        // Aktif köy ID'sini al
        const params = new URLSearchParams(location.search);

        const village =
            window.game_data?.village?.id ||
            params.get("village");

        if (!village) {
            throw new Error("Köy ID bulunamadı.");
        }

        // Mesaj yazma sayfası
        const url = new URL("/game.php", location.origin);

        url.searchParams.set("village", village);
        url.searchParams.set("screen", "mail");
        url.searchParams.set("mode", "new");

        if (params.has("t")) {
            url.searchParams.set("t", params.get("t"));
        }

        // Mesaj formunu arka planda al
        const response = await fetch(url.href, {
            credentials: "same-origin"
        });

        if (!response.ok) {
            throw new Error(
                "Mesaj formu alınamadı: " + response.status
            );
        }

        const html = await response.text();

        const doc = new DOMParser().parseFromString(
            html,
            "text/html"
        );

        // Mesaj gönderme formu
        const form = doc.querySelector(
            'form[action*="action=send"]'
        );

        if (!form) {
            throw new Error("Mesaj formu bulunamadı.");
        }

        // Güvenlik anahtarı
        const h =
            form.querySelector('input[name="h"]')?.value ||
            window.game_data?.csrf;

        if (!h) {
            throw new Error("Güvenlik anahtarı bulunamadı.");
        }

        // Gönderim adresi
        const action = new URL(
            form.getAttribute("action"),
            response.url
        );

        if (
            action.origin !== location.origin ||
            action.searchParams.get("action") !== "send"
        ) {
            throw new Error("Geçersiz gönderim adresi.");
        }

        // Mesaj verilerini hazırla
        const data = new URLSearchParams(
            new FormData(form)
        );

        data.set("h", h);
        data.set("to", alici);
        data.set("subject", konu);
        data.set("text", icerik);
        data.set("send", "Gönder");

        // MESAJI GÖNDER
        const sonuc = await fetch(action.href, {
            method: "POST",
            credentials: "same-origin",
            body: data,
            redirect: "follow"
        });

        if (!sonuc.ok) {
            throw new Error(
                "Gönderim hatası: " + sonuc.status
            );
        }

        // Sunucu yanıtını kontrol et
        const cevap = await sonuc.text();

        const kontrol = new DOMParser().parseFromString(
            cevap,
            "text/html"
        );

        const hata = kontrol.querySelector(
            "#error_message, .error_box"
        );

        if (hata && hata.textContent.trim()) {
            throw new Error(hata.textContent.trim());
        }

        console.log("Mesaj gönderme isteği tamamlandı.");
        console.log("Alıcı:", alici);
        console.log("Konu:", konu);
        console.log("İçerik:", icerik);
        console.log("Giden Kutusu'ndan kontrol edin.");

    } catch (error) {
        console.error("Mesaj hatası:", error);
        alert("Mesaj hatası: " + error.message);
    }
})();

