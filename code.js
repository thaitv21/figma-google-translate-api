figma.showUI(__html__, { width: 300, height: 200 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'translate') {
    const selected = figma.currentPage.selection;

    if (selected.length === 0) {
      figma.notify("❌ Chưa chọn Frame nào.");
      return;
    }

    const frame = selected[0];

    if (frame.type === 'TEXT') {
      await figma.loadFontAsync(node.fontName);
      const translated = await translateText(frame.characters, msg.targetLang);
      frame.characters = translated;
    }

    if (!("findAll" in frame)) {
      figma.notify("❌ Vui lòng chọn Frame hoặc Component.");
      return;
    }

    // Lấy tất cả text node bên trong frame
    const textNodes = frame.findAll(node => node.type === "TEXT");

    for (const node of textNodes) {
      if (node.fontName === figma.mixed) {
        console.log("⚠ Font bị mixed, bỏ qua");
        continue;
      }

      await figma.loadFontAsync(node.fontName);
      const translated = await translateText(node.characters, msg.targetLang);
      node.characters = translated;
    }

    figma.notify("✅ Dịch thành công!");
  }
};

// Gọi API dịch (demo với API dịch miễn phí)
async function translateText(text, targetLang) {
  console.log('Translating text:', text, 'to', targetLang);
  const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(text), {
    method: "GET",
  });
  const data = await res.text();
  const payload = JSON.parse(data);
  return payload[0][0][0];
}
