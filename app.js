const storageKey = "travelPlan4PaiSettings";

const elements = {
  apiKey: document.querySelector("#api-key"),
  modelName: document.querySelector("#model-name"),
  persona: document.querySelector("#persona"),
  saveStatus: document.querySelector("#save-status"),
  saveSettings: document.querySelector("#save-settings"),
  clearSettings: document.querySelector("#clear-settings"),
  destination: document.querySelector("#destination"),
  peopleCount: document.querySelector("#people-count"),
  startDate: document.querySelector("#start-date"),
  endDate: document.querySelector("#end-date"),
  preferences: document.querySelector("#preferences"),
  constraints: document.querySelector("#constraints"),
  generatePlan: document.querySelector("#generate-plan"),
  copyOutput: document.querySelector("#copy-output"),
  output: document.querySelector("#output"),
  generationStatus: document.querySelector("#generation-status"),
  fallbackTemplate: document.querySelector("#fallback-template"),
};

function loadSettings() {
  const rawSettings = localStorage.getItem(storageKey);
  if (!rawSettings) {
    return;
  }

  const settings = JSON.parse(rawSettings);
  elements.apiKey.value = settings.apiKey || "";
  elements.modelName.value = settings.modelName || "deepseek-chat";
  elements.persona.value = settings.persona || "";
  elements.saveStatus.textContent = "已从本地读取";
}

function saveSettings() {
  const settings = {
    apiKey: elements.apiKey.value.trim(),
    modelName: elements.modelName.value.trim() || "deepseek-chat",
    persona: elements.persona.value.trim(),
  };

  localStorage.setItem(storageKey, JSON.stringify(settings));
  elements.saveStatus.textContent = "已保存到本地";
}

function clearSettings() {
  localStorage.removeItem(storageKey);
  elements.apiKey.value = "";
  elements.modelName.value = "deepseek-chat";
  elements.persona.value = "";
  elements.saveStatus.textContent = "已清空";
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, "0")}月${String(date.getDate()).padStart(2, "0")}日`;
}

function validateForm() {
  const requiredFields = [
    [elements.apiKey.value.trim(), "请先填写 DeepSeek API Key。"],
    [elements.destination.value.trim(), "请填写目的地城市。"],
    [elements.startDate.value, "请选择开始日期。"],
    [elements.endDate.value, "请选择结束日期。"],
    [elements.preferences.value.trim(), "请填写游玩偏好。"],
  ];

  for (const [value, message] of requiredFields) {
    if (!value) {
      throw new Error(message);
    }
  }

  if (new Date(elements.endDate.value) < new Date(elements.startDate.value)) {
    throw new Error("结束日期不能早于开始日期。");
  }
}

function buildPrompt() {
  const dateRange = `${formatDate(elements.startDate.value)} 至 ${formatDate(elements.endDate.value)}`;
  const systemPrompt = elements.fallbackTemplate.content.textContent.trim();

  return `${systemPrompt}

本次输入：
目的地：${elements.destination.value.trim()}
日期范围：${dateRange}
同行人数：${elements.peopleCount.value || 1}人
游玩偏好：${elements.preferences.value.trim()}
个人人设：${elements.persona.value.trim() || "未填写，请只根据本次偏好推断。"}
必去地点或避雷点：${elements.constraints.value.trim() || "无"}

请直接输出可以粘贴到圆周旅记的纯文本攻略。`;
}

async function generatePlan() {
  try {
    validateForm();
    saveSettings();
    elements.generatePlan.disabled = true;
    elements.generationStatus.textContent = "生成中";
    elements.output.value = "正在请求 DeepSeek，请稍等...";

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${elements.apiKey.value.trim()}`,
      },
      body: JSON.stringify({
        model: elements.modelName.value.trim() || "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你专门把旅行计划改写成圆周旅记容易理解、可执行、无歧义的纯文本攻略。",
          },
          {
            role: "user",
            content: buildPrompt(),
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `DeepSeek API 请求失败：${response.status}`);
    }

    elements.output.value = data.choices?.[0]?.message?.content?.trim() || "DeepSeek 没有返回可用内容。";
    elements.generationStatus.textContent = "已生成";
  } catch (error) {
    elements.output.value = error.message;
    elements.generationStatus.textContent = "生成失败";
  } finally {
    elements.generatePlan.disabled = false;
  }
}

async function copyOutput() {
  if (!elements.output.value.trim()) {
    elements.generationStatus.textContent = "没有可复制内容";
    return;
  }

  await navigator.clipboard.writeText(elements.output.value);
  elements.generationStatus.textContent = "已复制";
}

elements.saveSettings.addEventListener("click", saveSettings);
elements.clearSettings.addEventListener("click", clearSettings);
elements.generatePlan.addEventListener("click", generatePlan);
elements.copyOutput.addEventListener("click", copyOutput);

loadSettings();
