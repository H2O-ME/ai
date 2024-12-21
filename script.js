class AIChatApp {
    constructor() {
        // 初始化聊天历史记录
        this.chatHistories = {
            gpt: new Map(),
            zhipu: new Map(),
            qwen: new Map(),
            flux: new Map(),
            sd: new Map()  // 添加 Stable Diffusion 的历史记录
        };
        
        // 初始化 GPT 配置
        this.gptConfig = {
            apiKey: 'sk-qCSVaohpHgxmgMY4p88O7TA4oNf8zGgBDofQRPMZFXv58HGh',
            baseUrl: 'https://api.chatanywhere.tech/v1/chat/completions',
            model: 'gpt-3.5-turbo-1106',
            models: {
                'gpt-4o-mini-2024-07-18': {
                    name: 'GPT-4 Mini (最新)',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-4o-mini': {
                    name: 'GPT-4 Mini',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-3.5-turbo-1106': {
                    name: 'GPT-3.5 Turbo (最新)',
                    maxTokens: 16385,
                    supportImage: false
                },
                'gpt-3.5-turbo-0613': {
                    name: 'GPT-3.5 Turbo (0613)',
                    maxTokens: 4096,
                    supportImage: false
                },
                'gpt-3.5-turbo-0301': {
                    name: 'GPT-3.5 Turbo (0301)',
                    maxTokens: 4096,
                    supportImage: false
                },
                'gpt-3.5': {
                    name: 'GPT-3.5',
                    maxTokens: 4096,
                    supportImage: false
                }
            }
        };
        
        // 其他初始化代码...
        this.currentModel = 'gpt';  // 默认模型
        this.conversationHistory = [];
        this.currentChatId = null;

        // 初始化其他配置
        this.initializeConfigs();
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTextarea();
        this.setupFileUpload();
        this.initializeMarked();
        
        // 加载历史记录
        this.loadChatHistories();
        
        // 创建欢迎界面
        this.createNewChat(true);

        // 初始化GPT模型选择器
        this.initializeGPTModelSelector();

        // 初始化智谱AI模型选择器
        const zhipuSelect = document.getElementById('zhipuModelSelect');
        if (zhipuSelect) {
            zhipuSelect.innerHTML = `
                <option value="glm-4v">GLM-4V</option>
                <option value="THUDM/glm-4-9b-chat">GLM-4-9B-Chat</option>
            `;
        }
    }

    initializeConfigs() {
        this.currentModel = 'gpt';
        
        // 更新智谱AI配置
        this.zhipuConfig = {
            models: {
                // GLM-4V - 使用智谱AI方API
                'glm-4v': {
                    name: 'GLM-4V',
                    maxTokens: 8192,
                    supportImage: true,
                    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                    apiKey: '8807fe42fcf8fa1208077876878dadbb.4xSEX4vp1Dzkx2WP'
                },
                // GLM-4-9B-Chat - 使用 SiliconFlow API
                'THUDM/glm-4-9b-chat': {
                    name: 'GLM-4-9B-Chat',
                    maxTokens: 8192,
                    supportImage: false,
                    baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
                    apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs'
                }
            },
            model: 'glm-4v'  // 默认使用支持图片的模型
        };
        
        // 图床配置
        this.imgbbConfig = {
            apiKey: '672b19ccee439f1b7875f3409fcab0ce',
            uploadUrl: 'https://api.imgbb.com/1/upload'
        };
        
        // 头像配置
        this.avatars = {
            ai: {
                gpt: 'https://img.icons8.com/?size=100&id=FBO05Dys9QCg&format=png&color=000000',
                zhipu: 'https://chatglm.cn/img/logo-collapse.d00ef130.svg',
                qwen: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Tongyi.svg',
                flux: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/blackforestlabs.svg',
                sd: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Stability.svg'  // 更新为正确的 Stable Diffusion 图标
            },
            user: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzY2NjY2NiIgZD0iTTEyIDJhMTAgMTAgMCAxIDAgMTAgMTBBMTAgMTAgMCAwIDAgMTIgMnptMCA1YTMgMyAwIDEgMSAwIDYgMyAzIDAgMCAxIDAtNnptMCAxM2E4LjAxIDguMDEgMCAwIDEtNi0yLjczVjE2YTMgMyAwIDAgMSAzLTNoNmEzIDMgMCAwIDEgMyAzdjEuMjdhOC4wMSA4LjAxIDAgMCAxLTYgMi43M3oiLz48L3N2Zz4=',
            system: 'https://chatglm.cn/img/logo-collapse.d00ef130.svg'
        };
        
        // 支持的文件类型
        this.supportedFiles = {
            image: ['image/jpeg', 'image/png', 'image/gif'],
            video: ['video/mp4']
        };
        
        // 对话历史管
        this.currentChatId = Date.now().toString();
        this.chatHistories = new Map();
        this.conversationHistory = [];

        // 添加GPT配置
        this.gptConfig = {
            apiKey: 'sk-qCSVaohpHgxmgMY4p88O7TA4oNf8zGgBDofQRPMZFXv58HGh',
            baseUrl: 'https://api.chatanywhere.tech/v1/chat/completions',
            model: 'gpt-3.5-turbo-1106',
            models: {
                'gpt-4o-mini-2024-07-18': {
                    name: 'GPT-4 Mini (最新)',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-4o-mini': {
                    name: 'GPT-4 Mini',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-3.5-turbo-1106': {
                    name: 'GPT-3.5 Turbo (最新)',
                    maxTokens: 16385,
                    supportImage: false
                },
                'gpt-3.5-turbo-0613': {
                    name: 'GPT-3.5 Turbo (0613)',
                    maxTokens: 4096,
                    supportImage: false
                },
                'gpt-3.5-turbo-0301': {
                    name: 'GPT-3.5 Turbo (0301)',
                    maxTokens: 4096,
                    supportImage: false
                },
                'gpt-3.5': {
                    name: 'GPT-3.5',
                    maxTokens: 4096,
                    supportImage: false
                }
            }
        };

        // 初始化完成后，如果当前是GPT模型，显示模型选择器
        if (this.currentModel === 'gpt') {
            const gptModelSelector = document.querySelector('.gpt-model-selector');
            if (gptModelSelector) {
                gptModelSelector.style.display = 'block';
            }
        }

        // 添加 Qwen 配置
        this.qwenConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',
            baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
            model: 'Qwen/Qwen2.5-7B-Instruct',
            models: {
                'Qwen/Qwen2.5-7B-Instruct': {
                    name: 'Qwen2.5-7B-Instruct',
                    maxTokens: 4096,
                    supportImage: false,
                    supportFunctionCall: true,
                    supportMultiLingual: true,
                    supportStructuredOutput: true
                }
            }
        };

        // 在 initializeConfigs 中添加 FLUX 配置
        this.fluxConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',  // 使用 SiliconFlow 的 API key
            baseUrl: 'https://api.siliconflow.cn/v1/images/generations',
            model: 'black-forest-labs/FLUX.1-schnell',
            models: {
                'black-forest-labs/FLUX.1-schnell': {
                    name: 'FLUX.1-schnell',
                    supportImageGen: true,
                    defaultSize: '1024x1024',
                    supportedSizes: ['1024x1024', '512x1024', '768x512', '768x1024', '1024x576', '576x1024']
                }
            }
        };

        // 在 initializeConfigs 中添加 Stable Diffusion 配置
        this.sdConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',  // 使用 SiliconFlow 的 API key
            baseUrl: 'https://api.siliconflow.cn/v1/images/generations',
            model: 'stabilityai/stable-diffusion-2-1',
            models: {
                'stabilityai/stable-diffusion-2-1': {
                    name: 'Stable Diffusion v2-1',
                    supportImageGen: true,
                    supportImageToImage: true,
                    defaultSize: '512x512',
                    supportedSizes: ['256x256', '512x512', '768x768', '1024x1024'],
                    defaultSteps: 30,
                    defaultGuidance: 7.5
                }
            }
        };
    }

    initializeElements() {
        this.chatHistory = document.getElementById('chatHistory');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.modelBtns = document.querySelectorAll('.model-btn');

        // 根据当前模型更新输入框提示文本
        this.updateInputPlaceholder();
    }

    initializeMarked() {
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return code;
            }
        });
    }

    createNewChat(isInitial = false) {
        // 保存当前对话
        if (this.currentChatId && !isInitial) {
            this.saveCurrentChat();
        }

        // 创建新对话
        this.currentChatId = Date.now().toString();
        
        // 确保当前模型的历史记录Map存在
        if (!this.chatHistories[this.currentModel]) {
            this.chatHistories[this.currentModel] = new Map();
        }

        this.chatHistories[this.currentModel].set(this.currentChatId, {
            title: '新对话',
            timestamp: Date.now(),
            messages: [],
            conversationHistory: [],
            model: this.currentModel
        });

        // 清空界面
        this.chatHistory.innerHTML = '';
        this.conversationHistory = [];
        
        // 获取当前选择的模型
        const selectedModel = document.getElementById('zhipuModelSelect')?.value;
        
        // 创建欢迎界面
        const welcomeSection = document.createElement('div');
        welcomeSection.className = 'welcome-section';
        
        // 根据不同模型显示不同的欢迎信息
        let welcomeContent = '';
        if (this.currentModel === 'flux') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="FLUX头像">
                </div>
                <h2>FLUX 图像生成助手</h2>
                <p>FLUX.1-schnell 是一个 120 亿参数的 Rectified Flow Transformer 模型，能够根据文本描述生成图像</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">一只可爱的猫咪</button>
                    <button class="suggestion-btn">日落时分的海滩</button>
                    <button class="suggestion-btn">星空下的城市</button>
                    <button class="suggestion-btn">油画风格的向日葵</button>
                </div>
            `;
        } else if (this.currentModel === 'sd') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="Stable Diffusion头像">
                </div>
                <h2>Stable Diffusion 图像生成助手</h2>
                <p>Stable Diffusion v2-1 是一个基于潜在扩散的文本到图像生成模型，支持文本生成图像和图像到图像的转换</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">一只在月光下奔跑的狼</button>
                    <button class="suggestion-btn">科幻风格的未来城市</button>
                    <button class="suggestion-btn">水彩画风格的春天樱花</button>
                    <button class="suggestion-btn">写实风格的人像素描</button>
                </div>
                <div class="img2img-hint">
                    <i class="fas fa-images"></i>
                    <span>图生图功能：先输入提示词，再点击右下角的图像按钮上传原图</span>
                </div>
            `;
        } else if (selectedModel === 'Qwen/Qwen2.5-7B-Instruct') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai.qwen}" alt="Qwen头像">
                </div>
                <h2>Qwen AI助手</h2>
                <p>阿里云Qwen2.5-7B-Instruct模型，支持多语言交流和结构化输出</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">我写一段代码</button>
                    <button class="suggestion-btn">生成JSON数据</button>
                    <button class="suggestion-btn">多语言翻译</button>
                    <button class="suggestion-btn">数学计算</button>
                </div>
            `;
        } else {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="AI头像">
                </div>
                <h2>AI对话助手</h2>
                <p>选择模型开始对话</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">你好，请做个自我介绍</button>
                    <button class="suggestion-btn">帮我写一段代码</button>
                    <button class="suggestion-btn">解释一个概念</button>
                    <button class="suggestion-btn">分析一个问题</button>
                </div>
            `;
        }
        
        welcomeSection.innerHTML = welcomeContent;
        this.chatHistory.appendChild(welcomeSection);
        
        // 绑定建议按钮事件
        this.bindSuggestionButtons();

        // 清空输入框
        if (this.userInput) {
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
        }

        // 更新历史列表
        this.updateHistoryList();
    }

    initializeEventListeners() {
        // 发送消息事件
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 切换模事
        this.modelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchModel(e.target.dataset.model);
            });
        });

        // 添加建议按钮点击事件
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.userInput.value = e.target.textContent;
                this.sendMessage();
            });
        });

        // 添加对话按钮事件
        document.querySelector('.new-chat-btn').addEventListener('click', () => {
            this.createNewChat();
        });

        // 添加智谱AI模型选择器事件
        const zhipuModelSelect = document.getElementById('zhipuModelSelect');
        if (zhipuModelSelect) {
            zhipuModelSelect.addEventListener('change', () => {
                console.log('Selected model:', zhipuModelSelect.value);
                this.updateFileUploadButton();
                this.createNewChat(true);
            });
        }

        // 添加 Qwen 模型选择器事件
        const qwenModelSelect = document.getElementById('qwenModelSelect');
        if (qwenModelSelect) {
            qwenModelSelect.addEventListener('change', () => {
                console.log('Selected Qwen model:', qwenModelSelect.value);
                this.updateFileUploadButton();
                this.createNewChat(true);
            });
        }
    }

    initializeTextarea() {
        // 自动整本框高度
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });
    }

    switchModel(model, createNew = true) {
        // 保存当前对话
        if (this.currentChatId) {
            this.saveCurrentChat();
        }

        this.currentModel = model;
        
        // 更新UI
        this.modelBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.model === model);
        });

        // 更新模型选择器显示状态
        const gptModelSelector = document.querySelector('.gpt-model-selector');
        const zhipuModelSelector = document.querySelector('.zhipu-model-selector');
        const qwenModelSelector = document.querySelector('.qwen-model-selector');
        const fluxModelSelector = document.querySelector('.flux-model-selector');
        
        // 隐藏所有选择器
        [gptModelSelector, zhipuModelSelector, qwenModelSelector, fluxModelSelector].forEach(selector => {
            if (selector) selector.style.display = 'none';
        });

        // 显示当前模型的选择器
        switch(model) {
            case 'gpt':
                if (gptModelSelector) gptModelSelector.style.display = 'block';
                break;
            case 'zhipu':
                if (zhipuModelSelector) zhipuModelSelector.style.display = 'block';
                break;
            case 'qwen':
                if (qwenModelSelector) qwenModelSelector.style.display = 'block';
                break;
            case 'flux':
                if (fluxModelSelector) fluxModelSelector.style.display = 'block';
                break;
        }

        // 更新文件上传按钮状态
        this.updateFileUploadButton();

        // 空当前对话ID和历史
        this.currentChatId = null;
        this.conversationHistory = [];

        if (createNew) {
            // 获取当��模型的最新对话
            const histories = Array.from(this.chatHistories[model].entries())
                .filter(([, chat]) => chat.model === model)  // 只获取当前模型的对话
                .sort(([, a], [, b]) => b.timestamp - a.timestamp);

            if (histories.length > 0) {
                // 加载最新的对话
                this.loadChat(histories[0][0]);
            } else {
                // 创建新对话
                this.createNewChat(true);
            }
        }

        // 更新输入框提示文本
        this.updateInputPlaceholder();

        // 更新文件上传按钮和图生图按钮
        this.updateButtons();
    }

    setupFileUpload() {
        const inputArea = document.querySelector('.input-area');

        // 如果是 SD 模型，添加图生图按钮
        if (this.currentModel === 'sd') {
            const img2imgBtn = document.createElement('button');
            img2imgBtn.innerHTML = '<i class="fas fa-images"></i>';
            img2imgBtn.className = 'img2img-btn';
            img2imgBtn.title = '图生图';
            inputArea.insertBefore(img2imgBtn, this.sendBtn);

            img2imgBtn.addEventListener('click', () => {
                // 先检查是否有提示词
                const prompt = this.userInput.value.trim();
                if (!prompt) {
                    this.addSystemMessage('请先输入提示词，描述你想要的图片效果');
                    this.userInput.focus();
                    return;
                }

                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                
                fileInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        if (file.size > 5 * 1024 * 1024) {  // 5MB
                            this.addSystemMessage('图片大小不能超过5MB');
                            return;
                        }
                        const base64Data = await this.fileToBase64(file);
                        await this.generateImageFromImage(base64Data, prompt);
                    }
                    fileInput.remove();
                });

                document.body.appendChild(fileInput);
                fileInput.click();
            });
        }

        // 其他文件上传按钮代码保持不变...
    }

    // 在 switchModel 方法中添加按钮更新
    updateButtons() {
        // 移除旧的图生图按钮
        const oldImg2imgBtn = document.querySelector('.img2img-btn');
        if (oldImg2imgBtn) {
            oldImg2imgBtn.remove();
        }

        // 重新设置文件上传和图生图按钮
        this.setupFileUpload();
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查当前模型是否支持图片
        const selectedModel = document.getElementById('zhipuModelSelect')?.value;
        
        if (this.currentModel === 'zhipu' && selectedModel !== 'glm-4v') {
            this.addSystemMessage('只有 GLM-4V 型支持图片处理');
            return;
        }

        if (this.currentModel !== 'zhipu' || selectedModel !== 'glm-4v') {
            this.addSystemMessage('当前模型不支持图片处理');
            return;
        }

        try {
            this.addSystemMessage('正在处理文件...');
            const base64Data = await this.fileToBase64(file);
            await this.handleImageUpload(base64Data);
        } catch (error) {
            console.error('文件处理错误:', error);
            this.addSystemMessage('文件处理失败，请重试');
        }

        event.target.value = '';
    }

    async handleVideoUpload(base64Video) {
        try {
            // 显示上传的视频
            this.addVideoMessage('user', base64Video);

            // 构建息对
            const message = {
                role: "user",
                content: [
                    {
                        type: "video_url",
                        video_url: {
                            url: base64Video.split(',')[1]  // 只发送base64数据部分，移除Data URL前缀
                        }
                    },
                    {
                        type: "text",
                        text: "请仔细描述个视频"
                    }
                ]
            };

            // 发送到智谱AI
            await this.getZhipuResponse(message);

        } catch (error) {
            console.error('视频处理错误:', error);
            this.addSystemMessage('视频处理失败，请重试');
        }
    }

    async handleImageUpload(base64Data) {
        try {
            // 显示上传的图片
            this.addImageMessage('user', base64Data);

            // 构建消息对象
            const message = {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: base64Data  // 保留完整的 base64 数据，包括前缀
                        }
                    },
                    {
                        type: "text",
                        text: "请分析这张图片"
                    }
                ]
            };

            // 发送到智谱AI
            await this.getZhipuResponse(message);

        } catch (error) {
            console.error('图片处理错误:', error);
            this.addSystemMessage('图片处理失败，请重试');
        }
    }

    async uploadToImgbb(base64Image) {
        try {
            // 创建FormData对象
            const formData = new FormData();
            formData.append('key', this.imgbbConfig.apiKey);
            
            // 从base64中提取实际的图片数据（移除"data:image/xxx;base64,"前缀）
            const imageData = base64Image.split(',')[1];
            formData.append('image', imageData);

            // 发送请求到imgbb
            const response = await fetch(this.imgbbConfig.uploadUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`图床服务响应错误: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error('图片上传失败: ' + (data.error?.message || '未错误'));
            }

            // 返回图片URL
            return data.data.url;

        } catch (error) {
            console.error('上传图片到imgbb失败:', error);
            throw new Error('图片上传到图床服务失败，请重试');
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    addImageMessage(sender, imageUrl) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // 添加头像
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = sender === 'user' ? this.avatars.user : this.avatars.ai[this.currentModel];
        avatarImg.alt = `${sender} avatar`;
        avatar.appendChild(avatarImg);
        messageDiv.appendChild(avatar);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'chat-image';
        
        messageContent.appendChild(img);
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    async sendMessage(text = null) {
        const message = text || this.userInput.value.trim();
        if (!message) return;

        this.sendBtn.classList.add('loading');
        
        try {
            // 清除欢迎界面
            const welcomeSection = document.querySelector('.welcome-section');
            if (welcomeSection) {
                welcomeSection.remove();
            }

            // 添加用户消息
            this.addMessageToChat('user', message);
            this.userInput.value = '';
            this.userInput.style.height = 'auto';

            // 如果是图像生成模型，直接生成图片
            if (this.currentModel === 'flux' || this.currentModel === 'sd') {
                await this.generateImage(message);
            } else {
                // 其他模型的普通对话请求
                await this.getAIResponse(message);
            }
            
            this.saveCurrentChat();
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // 加头像
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const avatarImg = document.createElement('img');
        
        // 根发送者和当前模型选择正确的头像
        if (sender === 'user') {
            avatarImg.src = this.avatars.user;
        } else if (sender === 'ai') {
            avatarImg.src = this.avatars.ai[this.currentModel];
        } else {
            avatarImg.src = this.avatars.system;
        }
        
        avatarImg.alt = `${sender} avatar`;
        avatar.appendChild(avatarImg);
        messageDiv.appendChild(avatar);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        if (sender === 'user') {
            messageContent.textContent = message;
        } else {
            messageContent.innerHTML = `<div class="loading">正在思考...</div>`;
            setTimeout(() => {
                // 使用 marked 处理 Markdown
                const htmlContent = marked.parse(message);
                messageContent.innerHTML = htmlContent;

                // 渲染数学公式
                renderMathInElement(messageContent, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\[', right: '\\]', display: true},
                        {left: '\\(', right: '\\)', display: false}
                    ],
                    throwOnError: false
                });

                // 高亮代码块
                messageContent.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 500);
        }
        
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    async getAIResponse(message, imageUrl = null) {
        // 获取当前选择的模型和系统提示
        const systemPrompts = {
            gpt: {
                role: "system",
                content: "你是 OpenAI 开发的 GPT 助手。请持专业、客观的回答风格，避免角色扮演你的回答应该准确、有帮助且符合伦理道德。"
            },
            zhipu: {
                'glm-4v': {
                    role: "system",
                    content: "你是智谱AI开发的GLM-4V视觉语言模型。你具备图像理解和自然语言交互的能力。请保持专业、客观专注于图像分析和文本理解任务。"
                },
                'THUDM/glm-4-9b-chat': {
                    role: "system",
                    content: "你是清华大学开发的GLM-4-9B-Chat模型。你是一个专注于文本理和生成的AI助手。请保持专业的学术风格，提供准确的知识和见解。"
                }
            },
            qwen: {
                role: "system",
                content: "你是阿里的通义千问助手。你支持多语言交流和结构化输出。请保持谨的专业态度，提供准确、有见地的回答。"
            }
        };

        if (this.currentModel === 'zhipu') {
            const selectedModel = document.getElementById('zhipuModelSelect').value;
            const systemPrompt = systemPrompts.zhipu[selectedModel];
            return await this.getZhipuResponse(message, imageUrl, systemPrompt);
        } else if (this.currentModel === 'gpt') {
            return await this.getGPTResponse(message, systemPrompts.gpt);
        } else if (this.currentModel === 'qwen') {
            return await this.getQwenResponse(message, systemPrompts.qwen);
        }
    }

    async getZhipuResponse(message, imageUrl = null, systemPrompt) {
        try {
            this.sendBtn.classList.add('loading');
            
            // 获取当前选择的模型配置
            const selectedModel = document.getElementById('zhipuModelSelect').value;
            const modelConfig = this.zhipuConfig.models[selectedModel];

            let requestBody = {
                model: selectedModel,
                messages: [],
                stream: true,
                temperature: 0.7,
                top_p: 0.7
            };

            // 添加系统提示
            if (systemPrompt) {
                requestBody.messages.push(systemPrompt);
            }

            // 添加用消息
            if (typeof message === 'string') {
                requestBody.messages.push({
                    role: "user",
                    content: message
                });
            } else if (message.content) {
                requestBody.messages.push(message);
            }

            // 添加历史对话记录，但确保系统提示始终在最前
            if (this.conversationHistory.length > 0 && systemPrompt) {
                requestBody.messages = [
                    systemPrompt,
                    ...this.conversationHistory,
                    requestBody.messages[requestBody.messages.length - 1]
                ];
            }

            console.log('Request URL:', modelConfig.baseUrl);
            console.log('Request Headers:', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${modelConfig.apiKey}`
            });
            console.log('Request Body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(modelConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${modelConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                
                if (response.status === 401) {
                    this.addSystemMessage('API认证失败，请检查API密钥是否正确或是否过期');
                    throw new Error('API认证失败');
                }
                
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            // 创建消息元素
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);

            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = '<div class="loading">正在思考...</div>';
            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);

            let fullContent = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            if (line.includes('[DONE]')) continue;

                            const data = JSON.parse(line.slice(6));
                            if (data.choices?.[0]?.delta?.content) {
                                const content = data.choices[0].delta.content;
                                fullContent += content;
                                
                                const htmlContent = marked.parse(fullContent);
                                messageContent.innerHTML = htmlContent;

                                // 渲染数学公式
                                renderMathInElement(messageContent, {
                                    delimiters: [
                                        {left: '$$', right: '$$', display: true},
                                        {left: '$', right: '$', display: false},
                                        {left: '\\[', right: '\\]', display: true},
                                        {left: '\\(', right: '\\)', display: false}
                                    ],
                                    throwOnError: false
                                });

                                // 高亮代码块
                                messageContent.querySelectorAll('pre code').forEach((block) => {
                                    hljs.highlightElement(block);
                                });

                                this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
                            }
                        } catch (e) {
                            if (!line.includes('[DONE]')) {
                                console.error('解析响应数据出错:', e);
                            }
                        }
                    }
                }
            }

            // 保存对话历史
            if (typeof message === 'string') {
                this.conversationHistory.push({
                    role: "user",
                    content: message
                });
            }

            this.conversationHistory.push({
                role: "assistant",
                content: fullContent
            });

            return fullContent;
        } catch (error) {
            console.error('智谱AI API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    async getGPTResponse(message, systemPrompt) {
        try {
            this.sendBtn.classList.add('loading');
            
            let requestBody = {
                model: this.gptConfig.model,
                messages: [
                    systemPrompt, // 添加GPT特定的系统提示
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: 2000,
                presence_penalty: 0,
                frequency_penalty: 0
            };

            // 构建消息内容
            if (typeof message === 'string') {
                requestBody.messages.push({
                    role: "user",
                    content: message
                });
            }

            // 添加历史对话记录
            if (this.conversationHistory.length > 0) {
                const recentHistory = this.conversationHistory.slice(-10);
                requestBody.messages = [
                    ...recentHistory,
                    requestBody.messages[0]
                ];
            }

            console.log('GPT Request Body:', JSON.stringify(requestBody, null, 2));
            console.log('GPT Config:', this.gptConfig);

            const response = await fetch(this.gptConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.gptConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('GPT API Error Response:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            // 创建消息元素
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);

            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = '<div class="loading">正在思考...</div>';
            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);

            let fullContent = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            if (line.includes('[DONE]')) continue;

                            const data = JSON.parse(line.slice(6));
                            if (data.choices?.[0]?.delta?.content) {
                                const content = data.choices[0].delta.content;
                                fullContent += content;
                                
                                // 使用 marked 和 KaTeX 渲染内容
                                const htmlContent = marked.parse(fullContent);
                                messageContent.innerHTML = htmlContent;

                                // 渲染数学公式
                                renderMathInElement(messageContent, {
                                    delimiters: [
                                        {left: '$$', right: '$$', display: true},
                                        {left: '$', right: '$', display: false},
                                        {left: '\\[', right: '\\]', display: true},
                                        {left: '\\(', right: '\\)', display: false}
                                    ],
                                    throwOnError: false
                                });

                                // 高亮代码块
                                messageContent.querySelectorAll('pre code').forEach((block) => {
                                    hljs.highlightElement(block);
                                });

                                this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
                            }
                        } catch (e) {
                            if (!line.includes('[DONE]')) {
                                console.error('解析响应数据出错:', e);
                            }
                        }
                    }
                }
            }

            // 保存对话历史
            if (typeof message === 'string') {
                this.conversationHistory.push({
                    role: "user",
                    content: message
                });
            }

            this.conversationHistory.push({
                role: "assistant",
                content: fullContent
            });

            return fullContent;
        } catch (error) {
            console.error('GPT API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    async getQwenResponse(message, systemPrompt) {
        try {
            this.sendBtn.classList.add('loading');
            
            const maxTokens = Math.min(
                this.qwenConfig.models[this.qwenConfig.model].maxTokens,
                4096  // 确保不超过4096
            );
            
            let requestBody = {
                model: this.qwenConfig.model,
                messages: [
                    systemPrompt,
                    {
                        role: "user",
                        content: message
                    }
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: maxTokens
            };

            // 添加历史对话记录
            if (this.conversationHistory.length > 0) {
                requestBody.messages = [
                    requestBody.messages[0], // 保持系统提示在最前
                    ...this.conversationHistory.slice(-10),
                    requestBody.messages[1]
                ];
            }

            const response = await fetch(this.qwenConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.qwenConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            // 处理流式响应...
            // 这部分代码与 getGPTResponse 中的流式响应处理相同
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);

            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = '<div class="loading">正在思考...</div>';
            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);

            let fullContent = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            if (line.includes('[DONE]')) continue;

                            const data = JSON.parse(line.slice(6));
                            if (data.choices?.[0]?.delta?.content) {
                                const content = data.choices[0].delta.content;
                                fullContent += content;
                                
                                const htmlContent = marked.parse(fullContent);
                                messageContent.innerHTML = htmlContent;

                                // 渲染数学公式
                                renderMathInElement(messageContent, {
                                    delimiters: [
                                        {left: '$$', right: '$$', display: true},
                                        {left: '$', right: '$', display: false},
                                        {left: '\\[', right: '\\]', display: true},
                                        {left: '\\(', right: '\\)', display: false}
                                    ],
                                    throwOnError: false
                                });

                                // 高亮代码块
                                messageContent.querySelectorAll('pre code').forEach((block) => {
                                    hljs.highlightElement(block);
                                });

                                this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
                            }
                        } catch (e) {
                            if (!line.includes('[DONE]')) {
                                console.error('解析响应数据出错:', e);
                            }
                        }
                    }
                }
            }

            // 保存对话历史
            this.conversationHistory.push({
                role: "user",
                content: message
            });

            this.conversationHistory.push({
                role: "assistant",
                content: fullContent
            });

            return fullContent;
        } catch (error) {
            console.error('Qwen API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    // 添加视频消息显示方法
    addVideoMessage(sender, videoUrl) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // 添加头像
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = sender === 'user' ? this.avatars.user : this.avatars.ai[this.currentModel];
        avatarImg.alt = `${sender} avatar`;
        avatar.appendChild(avatarImg);
        messageDiv.appendChild(avatar);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const video = document.createElement('video');
        video.src = videoUrl;
        video.className = 'chat-video';
        video.controls = true;
        video.preload = 'metadata';  // 只加载视频元数据
        video.controlsList = 'nodownload';  // 禁止下载
        
        messageContent.appendChild(video);
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    // 修改系统消息方法，添加头像参数
    addSystemMessage(message, avatar = this.avatars.system) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'system-message');
        
        // 添加系统消息头像
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = avatar;
        avatarImg.alt = 'system avatar';
        avatarDiv.appendChild(avatarImg);
        messageDiv.appendChild(avatarDiv);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    // 添加测试方法
    async testAvatarUrls() {
        for (const [key, url] of Object.entries(this.avatars)) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (!response.ok) {
                    console.error(`${key} 头像URL不访问:`, url);
                }
            } catch (error) {
                console.error(`测试 ${key} 头像URL时出错:`, error);
            }
        }
    }

    // 添加历史记录管理法
    loadChatHistories() {
        try {
            const savedHistories = localStorage.getItem('chatHistories');
            if (savedHistories) {
                const histories = JSON.parse(savedHistories);
                this.chatHistories = {
                    gpt: new Map(histories.gpt || []),
                    zhipu: new Map(histories.zhipu || []),
                    qwen: new Map(histories.qwen || []),
                    flux: new Map(histories.flux || []),
                    sd: new Map(histories.sd || [])  // 添加 sd
                };
            }
            this.updateHistoryList();
        } catch (error) {
            console.error('加载历史记录失败:', error);
            // 发生错误时，确保初始化空的 Map
            this.chatHistories = {
                gpt: new Map(),
                zhipu: new Map(),
                qwen: new Map(),
                flux: new Map(),
                sd: new Map()
            };
        }
    }

    saveChatHistories() {
        try {
            // 添加安全检查
            if (!this.chatHistories || !this.chatHistories.gpt || !this.chatHistories.zhipu || 
                !this.chatHistories.qwen || !this.chatHistories.flux || !this.chatHistories.sd) {
                console.error('chatHistories 未正确初始化');
                // 重新初始化
                this.chatHistories = {
                    gpt: new Map(),
                    zhipu: new Map(),
                    qwen: new Map(),
                    flux: new Map(),
                    sd: new Map()
                };
            }

            const historiesData = {
                gpt: Array.from(this.chatHistories.gpt.entries()),
                zhipu: Array.from(this.chatHistories.zhipu.entries()),
                qwen: Array.from(this.chatHistories.qwen.entries()),
                flux: Array.from(this.chatHistories.flux.entries()),
                sd: Array.from(this.chatHistories.sd.entries())
            };
            
            localStorage.setItem('chatHistories', JSON.stringify(historiesData));
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }

    updateHistoryList() {
        const historyList = document.querySelector('.chat-history-list');
        historyList.innerHTML = '';

        // 获取当前模型的所有历史记录
        const histories = Array.from(this.chatHistories[this.currentModel].entries())
            .sort(([, a], [, b]) => b.timestamp - a.timestamp);  // 移除了 filter，显示所有记录

        if (histories.length === 0) {
            historyList.innerHTML = `
                <div class="chat-history-empty">
                    暂无历史对话
                </div>
            `;
            return;
        }

        // 更新模型名称映射
        const modelNames = {
            gpt: 'GPT',
            zhipu: '智谱AI',
            qwen: 'Qwen',
            flux: 'FLUX',
            sd: 'Stable Diffusion'  // 添加 SD
        };

        // 获取当前的模
        const selectedModel = document.getElementById('zhipuModelSelect')?.value;
        
        for (const [id, chat] of histories) {
            const historyItem = document.createElement('div');
            historyItem.className = `chat-history-item${id === this.currentChatId ? ' active' : ''}`;
            
            // 确定模型标记的类名
            let modelTagClass = chat.model;
            if (chat.model === 'zhipu') {
                if (selectedModel === 'Qwen/Qwen2.5-7B-Instruct') {
                    modelTagClass = 'qwen';
                }
            }

            historyItem.innerHTML = `
                <div class="chat-history-content">
                    <div class="chat-history-title">
                        <span class="model-tag ${modelTagClass}">${
                            selectedModel === 'Qwen/Qwen2.5-7B-Instruct' ? 'Qwen' : modelNames[chat.model]
                        }</span>
                        <span>${chat.title || '新对话'}</span>
                    </div>
                    <div class="chat-history-time">${this.formatTime(chat.timestamp)}</div>
                </div>
                <div class="chat-history-delete" title="删除话">
                    <i class="fas fa-trash"></i>
                </div>
            `;

            // 点击对话
            historyItem.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-history-delete')) {
                    this.loadChat(id);
                }
            });

            // 删除对话
            historyItem.querySelector('.chat-history-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(id);
            });

            historyList.appendChild(historyItem);
        }
    }

    saveCurrentChat() {
        if (!this.currentChatId || !this.currentModel) return;

        // 获取第一条非系消息为标题
        let title = '新对话';
        const messages = Array.from(this.chatHistory.children);
        for (const msg of messages) {
            if (!msg.classList.contains('system-message') && 
                !msg.classList.contains('welcome-section')) {
                const content = msg.querySelector('.message-content');
                if (content) {
                    title = content.textContent.slice(0, 20) + 
                           (content.textContent.length > 20 ? '...' : '');
                    break;
                }
            }
        }

        // 创建话数据
        const chatData = {
            id: this.currentChatId,
            title,
            timestamp: Date.now(),
            messages: messages.map(el => el.outerHTML),
            conversationHistory: this.conversationHistory,
            model: this.currentModel
        };

        // 严格保存当前模型的历史记录中
        this.chatHistories[this.currentModel].set(this.currentChatId, chatData);
        
        // 保存到localStorage
        this.saveChatHistories();
        
        // 更新UI
        this.updateHistoryList();
    }

    loadChat(chatId) {
        // 保存当前对话
        if (this.currentChatId) {
            this.saveCurrentChat();
        }

        // 只在当前模型的历史记录中查找
        const chatData = this.chatHistories[this.currentModel].get(chatId);
        if (!chatData) return;

        // 保对话属于当前模型
        if (chatData.model !== this.currentModel) {
            console.warn('对话模型不匹配，跳过加载');
            return;
        }

        // 加载对话
        this.currentChatId = chatId;
        this.chatHistory.innerHTML = chatData.messages.join('');
        this.conversationHistory = chatData.conversationHistory;

        // 重新绑定建议按钮事件
        this.bindSuggestionButtons();

        // 更新UI
        this.updateHistoryList();
    }

    deleteChat(chatId) {
        // 从当前模型的历史记录中删除
        this.chatHistories[this.currentModel].delete(chatId);
        this.saveChatHistories();
        this.updateHistoryList();

        // 如果删除的当前对话，建新对话
        if (chatId === this.currentChatId) {
            this.createNewChat(true);
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }

    bindSuggestionButtons() {
        const buttons = this.chatHistory.querySelectorAll('.suggestion-btn');
        buttons.forEach(btn => {
            // 除旧的事件监听器
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // 添加新的事件监听器
            newBtn.addEventListener('click', (e) => {
                this.userInput.value = e.target.textContent;
                this.sendMessage();
            });
        });
    }

    initializeGPTModelSelector() {
        this.gptModelSelect = document.getElementById('gptModelSelect');
        if (this.gptModelSelect) {
            this.gptModelSelect.addEventListener('change', (e) => {
                this.gptConfig.model = e.target.value;
                // 更新文件上传按钮状态
                this.updateFileUploadButton();
            });
        }
    }

    updateFileUploadButton() {
        const uploadBtn = document.querySelector('.upload-btn');
        if (!uploadBtn) return;

        // 只在 GLM-4V 模型下显示上传按钮，FLUX模型不需要上传按钮
        if (this.currentModel === 'zhipu') {
            const selectedModel = document.getElementById('zhipuModelSelect')?.value;
            uploadBtn.style.display = selectedModel === 'glm-4v' ? 'flex' : 'none';
        } else {
            uploadBtn.style.display = 'none';
        }
    }

    // 修改生成图片方法
    async generateImage(prompt) {
        let progressInterval;
        let progressDiv;
        
        try {
            this.sendBtn.classList.add('loading');
            
            // 使用FLUX/SD头像显示生成提示
            this.addSystemMessage('正在生成图像...', this.avatars.ai[this.currentModel]);
            
            // 添加进度条
            progressDiv = document.createElement('div');
            progressDiv.className = 'image-generation-progress';
            progressDiv.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0%</div>
            `;
            this.chatHistory.appendChild(progressDiv);

            // 模拟进度更新
            let progress = 0;
            const progressFill = progressDiv.querySelector('.progress-fill');
            const progressText = progressDiv.querySelector('.progress-text');
            progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.random() * 5;
                    progress = Math.min(progress, 90);
                    progressFill.style.width = `${progress}%`;
                    progressText.textContent = `${Math.round(progress)}%`;
                }
            }, 200);

            const requestBody = {
                model: this.fluxConfig.model,
                prompt: prompt,
                image_size: this.fluxConfig.models[this.fluxConfig.model].defaultSize,
                batch_size: 1,
                num_inference_steps: 20,
                guidance_scale: 7.5,
                prompt_enhancement: true
            };

            console.log('FLUX Request URL:', this.fluxConfig.baseUrl);
            console.log('FLUX Request Headers:', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.fluxConfig.apiKey}`
            });
            console.log('FLUX Request Body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(this.fluxConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.fluxConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('FLUX API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    error: errorData
                });
                
                let errorMessage = '图像生成失败';
                if (errorData.error?.message) {
                    errorMessage += `: ${errorData.error.message}`;
                } else if (errorData.message) {
                    errorMessage += `: ${errorData.message}`;
                } else if (typeof errorData === 'string') {
                    errorMessage += `: ${errorData}`;
                }
                
                if (response.status === 401) {
                    errorMessage = 'API认证失败，请检查API密钥是否正确';
                } else if (response.status === 429) {
                    errorMessage = '请求过于频繁，请稍后再试';
                } else if (response.status === 400) {
                    errorMessage = `请求参数错误: ${errorData.message || '未知错误'}`;
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('FLUX API Response:', data);
            
            // 完成进度条并移除
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            if (progressDiv && progressDiv.parentNode) {
                progressFill.style.width = '100%';
                progressText.textContent = '100%';
                
                // 确保进度条被移除
                setTimeout(() => {
                    if (progressDiv && progressDiv.parentNode) {
                        progressDiv.remove();
                    }
                }, 500);
            }

            // 显示生成���图片
            if (data.images && data.images.length > 0) {
                this.addImageMessage('ai', data.images[0].url);
                
                // 保存对话历史
                this.conversationHistory.push({
                    role: "user",
                    content: `生成图片: ${prompt}`
                });
                
                this.conversationHistory.push({
                    role: "assistant",
                    content: `已生成图片: ${data.images[0].url}`
                });
            } else {
                throw new Error('API返回数据中没有图片');
            }

        } catch (error) {
            console.error(`${this.currentModel}图像生成错误:`, error);
            this.addSystemMessage(`图像生成失败: ${error.message}`);
        } finally {
            // 确保进度条和定时器被清理
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            if (progressDiv && progressDiv.parentNode) {
                progressDiv.remove();
            }
            this.sendBtn.classList.remove('loading');
        }
    }

    // 添加输入框提示文本更新方法
    updateInputPlaceholder() {
        if (this.userInput) {
            if (this.currentModel === 'flux' || this.currentModel === 'sd') {
                this.userInput.placeholder = '请输入图片描述...';
            } else {
                this.userInput.placeholder = '请输入您的问题...';
            }
        }
    }

    // 添加图生图方法
    async generateImageFromImage(sourceImage, prompt) {
        let progressInterval;
        let progressDiv;
        
        try {
            this.sendBtn.classList.add('loading');
            
            // 添加用户消息显示提示词
            this.addMessageToChat('user', `图生图提示词: ${prompt}`);
            
            // 使用SD头像显示生成提示
            this.addSystemMessage('正在生成图像...', this.avatars.ai.sd);
            
            // 添加进度条
            progressDiv = document.createElement('div');
            progressDiv.className = 'image-generation-progress';
            progressDiv.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0%</div>
            `;
            this.chatHistory.appendChild(progressDiv);

            // 模拟进度更新
            let progress = 0;
            const progressFill = progressDiv.querySelector('.progress-fill');
            const progressText = progressDiv.querySelector('.progress-text');
            progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.random() * 5;
                    progress = Math.min(progress, 90);
                    progressFill.style.width = `${progress}%`;
                    progressText.textContent = `${Math.round(progress)}%`;
                }
            }, 200);

            const requestBody = {
                model: this.sdConfig.model,
                prompt: prompt,  // 确保提示词不为空
                image: sourceImage.split(',')[1],  // 移除 base64 前缀
                image_size: this.sdConfig.models[this.sdConfig.model].defaultSize,
                num_inference_steps: this.sdConfig.models[this.sdConfig.model].defaultSteps,
                guidance_scale: this.sdConfig.models[this.sdConfig.model].defaultGuidance,
                strength: 0.75  // 控制原图保留程度
            };

            console.log('SD Request Body:', {
                ...requestBody,
                image: '(base64 image data...)'  // 避免日志中显示完整的图片数据
            });

            const response = await fetch(this.sdConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.sdConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Stable Diffusion 图生图错误:', errorData);
                throw new Error(errorData.message || '图像生成失败');
            }

            const data = await response.json();
            console.log('Stable Diffusion 图生图响应:', data);

            // 完成进度条
            if (progressInterval) {
                clearInterval(progressInterval);
                progressInterval = null;
            }
            if (progressDiv && progressDiv.parentNode) {
                progressFill.style.width = '100%';
                progressText.textContent = '100%';
                setTimeout(() => {
                    if (progressDiv && progressDiv.parentNode) {
                        progressDiv.remove();
                    }
                }, 500);
            }

            // 显示原图和生成的图片
            this.addImageMessage('user', sourceImage);
            if (data.images && data.images.length > 0) {
                this.addImageMessage('ai', data.images[0].url);
                
                // 保存对话历史
                this.conversationHistory.push({
                    role: "user",
                    content: `图生图提示词: ${prompt}\n原图: (图片数据)`
                });
                
                this.conversationHistory.push({
                    role: "assistant",
                    content: `已生成图片: ${data.images[0].url}`
                });
            } else {
                throw new Error('API返回数据中没有图片');
            }

        } catch (error) {
            console.error('Stable Diffusion 图生图错误:', error);
            this.addSystemMessage(`图像生成失败: ${error.message}`);
        } finally {
            // 确保进度条和定时器被清理
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            if (progressDiv && progressDiv.parentNode) {
                progressDiv.remove();
            }
            this.sendBtn.classList.remove('loading');
        }
    }
}

// 初始应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new AIChatApp();
});