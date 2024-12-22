class AIChatApp {
    constructor() {
        // 初始化聊天历史记录
        this.chatHistories = {
            gpt: new Map(),
            zhipu: new Map(),
            qwen: new Map(),
            flux: new Map(),
            sd: new Map(),
            video: new Map()  // 添加视频模型的历史记录
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

        // 添加请求控制器
        this.currentRequest = null;
        this.abortController = null;

        // 检测移动端并处理横屏
        this.handleMobileOrientation();

        // 处理开屏页面
        this.handleSplashScreen();
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
                sd: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Stability.svg',
                video: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Lightricks.png'  // 添加 LTX-Video 头像
            },
            user: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzY2NjY2NiIgZD0iTTEyIDJhMTAgMTAgMCAxIDAgMTAgMTBBMTAgMTAgMCAwIDAgMTIgMnptMCA1YTMgMyAwIDEgMSAwIDYgMyAzIDAgMCAxIDAtNnptMCAxM2E4LjAxIDguMDEgMCAwIDEtNi0yLjczVjE2YTMgMyAwIDAgMSAzLTNoNmEzIDMyIDAgMCAxIDMgM3YxLjI3YTguMDEgOC4wMSAwIDAgMS02IDIuNzN6Ii8+PC9zdmc+',
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

        // 初始化完成后，如果当前是SD模型，显示模型选择器
        if (this.currentModel === 'sd') {
            const sdModelSelector = document.querySelector('.sd-model-selector');
            if (sdModelSelector) {
                sdModelSelector.style.display = 'block';
                // 设置默认选中的模型文本
                const selectedModelText = sdModelSelector.querySelector('.selected-model span');
                if (selectedModelText) {
                    const defaultModel = this.sdConfig.models[this.sdConfig.model];
                    selectedModelText.textContent = defaultModel.name;
                }
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
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',
            baseUrl: 'https://api.siliconflow.cn/v1/images/generations',
            model: 'stabilityai/stable-diffusion-3-5-large',  // 修改默认模型为 3.5 版本
            models: {
                'stabilityai/stable-diffusion-3-5-large': {
                    name: 'Stable Diffusion v3.5',
                    supportImageGen: true,
                    supportImageToImage: false,  // 不支持图生图
                    defaultSize: '1024x1024',
                    supportedSizes: ['1024x1024', '512x1024', '768x512', '768x1024', '1024x576', '576x1024'],
                    defaultSteps: 20,
                    defaultGuidance: 7.5
                },
                'stabilityai/stable-diffusion-2-1': {
                    name: 'Stable Diffusion v2.1',
                    supportImageGen: true,
                    supportImageToImage: true,  // 支持图生图
                    defaultSize: '512x512',
                    supportedSizes: ['256x256', '512x512', '768x768', '1024x1024'],
                    defaultSteps: 30,
                    defaultGuidance: 7.5
                }
            }
        };

        // 在 initializeConfigs 方法中添加视频配置
        this.videoConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',
            submitUrl: 'https://api.siliconflow.cn/v1/video/submit',  // 修改为正确的 URL
            statusUrl: 'https://api.siliconflow.cn/v1/video/status',  // 修改为正确的 URL
            model: 'Lightricks/LTX-Video',
            models: {
                'Lightricks/LTX-Video': {
                    name: 'LTX-Video',
                    supportVideoGen: true,
                    supportImageToVideo: true,
                    maxDuration: 10,
                    defaultSteps: 30
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
                <h2>FLUX 图像生成模型</h2>
                <p>FLUX.1-schnell 是一个 120 亿参数的 Rectified Flow Transformer 模型，能够根据文本描述生成图像</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">一只可爱的猫咪</button>
                    <button class="suggestion-btn">日落时分的海滩</button>
                    <button class="suggestion-btn">星空下的城市</button>
                    <button class="suggestion-btn">油画风格的向日葵</button>
                </div>
            `;
        } else if (this.currentModel === 'sd') {
            // 使用新的选择器结构获取当前选中的模型
            const selectedModelText = document.querySelector('.sd-model-selector .selected-model span')?.textContent;
            const modelVersion = selectedModelText?.includes('v3.5') ? 'v3.5' : 'v2.1';
            const supportsImg2Img = selectedModelText?.includes('v2.1');
            
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="Stable Diffusion头像">
                </div>
                <h2>Stable Diffusion 图像生成模型</h2>
                <p>Stable Diffusion ${modelVersion} 是一个基于潜在扩散的文本到图像生成模型${supportsImg2Img ? '，支持文本生成图像和图像到图像的转换' : '，专注于高质量的文本到图像生成'}</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">一只在月光下奔跑的狼</button>
                    <button class="suggestion-btn">科幻风格的未来城市</button>
                    <button class="suggestion-btn">水墨画风格的春天樱花</button>
                    <button class="suggestion-btn">写实风格的人像素描</button>
                </div>
                ${supportsImg2Img ? `
                <div class="img2img-hint">
                    <i class="fas fa-images"></i>
                    <span>图生图功能：先输入提示词，再点右下角的图像按钮上传原图</span>
                </div>
                ` : ''}
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
        } else if (this.currentModel === 'video') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="LTX-Video头像">
                </div>
                <h2>LTX-Video 视频生成模型</h2>
                <p>LTX-Video 是一个强大的文本到视频生成模型，支持文本生成视频和图片转视频功能</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">一只猫咪在玩毛线球</button>
                    <button class="suggestion-btn">日落时分的海浪</button>
                    <button class="suggestion-btn">城市街道的车流</button>
                    <button class="suggestion-btn">下雨天的窗户</button>
                </div>
                <div class="img2video-hint">
                    <i class="fas fa-film"></i>
                    <span>图片转视频功能：先输入提示词，再点击右下角的图片按钮上传原图</span>
                </div>
            `;
        } else {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="AI头像">
                </div>
                <h2>大语言模型</h2>
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

        // 添加 SD 模型选择器事件
        const sdModelSelector = document.querySelector('.sd-model-selector');
        if (sdModelSelector) {
            const selectedModelText = sdModelSelector.querySelector('.selected-model span');
            const modelOptions = sdModelSelector.querySelectorAll('.model-option');
            
            modelOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    const text = option.childNodes[0].textContent.trim();
                    
                    // 更新选中的显示文本
                    selectedModelText.textContent = text;
                    
                    // 更新配置
                    this.sdConfig.model = value;
                    
                    // 创建新对话
                    this.createNewChat(true);
                    
                    // 更新图生图按钮
                    this.updateButtons();
                    
                    // 更新历史记录显示
                    this.updateHistoryList();
                });
            });
        }

        // 添加图片双击事件监听
        this.chatHistory.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('chat-image')) {
                const imageViewer = document.querySelector('.image-viewer');
                const viewerImage = imageViewer.querySelector('img');
                viewerImage.src = e.target.src;
                imageViewer.style.display = 'flex';
                setTimeout(() => {
                    imageViewer.classList.add('active');
                }, 10);
            }
        });

        // 添加关闭图片查看器的事件
        const closeViewer = document.querySelector('.close-viewer');
        if (closeViewer) {
            closeViewer.addEventListener('click', () => {
                const imageViewer = document.querySelector('.image-viewer');
                imageViewer.classList.remove('active');
                setTimeout(() => {
                    imageViewer.style.display = 'none';
                }, 300);
            });
        }

        // 点击背景关闭图片查看器
        const imageViewer = document.querySelector('.image-viewer');
        if (imageViewer) {
            imageViewer.addEventListener('click', (e) => {
                if (e.target.classList.contains('image-viewer')) {
                    imageViewer.classList.remove('active');
                    setTimeout(() => {
                        imageViewer.style.display = 'none';
                    }, 300);
                }
            });
        }

        // 添加 ESC 键关闭功能
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const imageViewer = document.querySelector('.image-viewer');
                if (imageViewer && imageViewer.classList.contains('active')) {
                    imageViewer.classList.remove('active');
                    setTimeout(() => {
                        imageViewer.style.display = 'none';
                    }, 300);
                }
            }
        });
    }

    initializeTextarea() {
        // 自动整本框高度
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });
    }

    switchModel(model, createNew = true) {
        // 如果有正在进行的请求，先在当前对话中显示取消消息
        if (this.currentRequest) {
            const systemMessages = Array.from(this.chatHistory.children)
                .filter(el => el.classList.contains('system-message'));
            const lastSystemMessage = systemMessages[systemMessages.length - 1];
            if (lastSystemMessage) {
                lastSystemMessage.querySelector('.message-content').textContent = '图片生成已取消';
            }
            
            // 清除所有进度条
            document.querySelectorAll('.image-generation-progress').forEach(el => {
                el.remove();
            });
        }
        
        // 取消当前正在进行的请求
        this.cancelCurrentRequest();
        
        // 保存当前对话
        if (this.currentChatId) {
            this.saveCurrentChat();
        }

        // 更新当前模型
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
        const sdModelSelector = document.querySelector('.sd-model-selector');  // 添加 SD 选择器
        const videoModelSelector = document.querySelector('.video-model-selector');  // 添加视频模型选择器
        
        // 隐藏所有选择器
        [gptModelSelector, zhipuModelSelector, qwenModelSelector, fluxModelSelector, sdModelSelector, videoModelSelector].forEach(selector => {
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
            case 'sd':
                if (sdModelSelector) sdModelSelector.style.display = 'block';
                break;
            case 'video':
                if (videoModelSelector) videoModelSelector.style.display = 'block';
                break;
        }

        // 更新文件上传按钮状态
        this.updateFileUploadButton();

        // 清空当前对话ID和历史
        this.currentChatId = null;
        this.conversationHistory = [];

        if (createNew) {
            // 创建新对话
            this.createNewChat(true);
        }

        // 更新输入框提示文本
        this.updateInputPlaceholder();

        // 更新文件上传按钮和图生图按钮
        this.updateButtons();
    }

    setupFileUpload() {
        const inputArea = document.querySelector('.input-area');

        // 如果是 SD 模型，且是 2.1 版本时，添加图生图按钮
        if (this.currentModel === 'sd') {
            // 使用新的选择器结构获取当前选中的模型
            const selectedModelText = document.querySelector('.sd-model-selector .selected-model span')?.textContent;
            if (selectedModelText && selectedModelText.includes('v2.1')) {
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
        }
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
            // 显示上传图片
            this.addImageMessage('user', base64Data);

            // 构建消息对象
            const message = {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: base64Data  // 保留完整的 base64 数据，括前缀
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
            
            // 从base64中提取实际������图片��据（移除"data:image/xxx;base64,"前缀）
            const imageData = base64Image.split(',')[1];
            formData.append('image', imageData);

            // 发请求到imgbb
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
        img.title = '双击查看大图';  // 添加提示文字
        
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

            // 根据不同模型处理请求
            if (this.currentModel === 'flux' || this.currentModel === 'sd') {
                await this.generateImage(message);
            } else if (this.currentModel === 'video') {
                await this.generateVideo(message);
            } else {
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
                content: "你是 OpenAI 开发的 GPT 助手。请持专业、客观的回答，你的回答应该准确、有帮助且符合伦理道德。"
            },
            zhipu: {
                'glm-4v': {
                    role: "system",
                    content: "你是智谱AI开发的GLM-4V视觉语言模型。你具备图像理解和自然语言交互的能力。请保持专业、客观专注于图像分析和文本理解任务。"
                },
                'THUDM/glm-4-9b-chat': {
                    role: "system",
                    content: "你是清华大学开发的GLM-4-9B-Chat模型，你是一个专注于文本理解和生成的AI助手。请保持专业的学术风格，提供准确的知识和见解。"
                }
            },
            qwen: {
                role: "system",
                content: "你是阿里的通义千问助手。你支持多语言交流和结构化输出。请保持严谨的专业态度，提供准确、有见地回答。"
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
            
            // 获取当前选择的型配置
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

            // 保存对话史
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

            // 创建信息元素
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
                                console.error('解析���应数���出错:', e);
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
            this.addSystemMessage(`API调失败: ${error.message}`);
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
        
        // 添加系统消息头
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
                    sd: new Map(histories.sd || []),
                    video: new Map(histories.video || [])  // 添加 video
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
                sd: new Map(),
                video: new Map()
            };
        }
    }

    saveChatHistories() {
        try {
            // 添加安全检查
            if (!this.chatHistories || !this.chatHistories.gpt || !this.chatHistories.zhipu || 
                !this.chatHistories.qwen || !this.chatHistories.flux || !this.chatHistories.sd || !this.chatHistories.video) {
                console.error('chatHistories 未正确初始化');
                // 重新初始化
                this.chatHistories = {
                    gpt: new Map(),
                    zhipu: new Map(),
                    qwen: new Map(),
                    flux: new Map(),
                    sd: new Map(),
                    video: new Map()
                };
            }

            const historiesData = {
                gpt: Array.from(this.chatHistories.gpt.entries()),
                zhipu: Array.from(this.chatHistories.zhipu.entries()),
                qwen: Array.from(this.chatHistories.qwen.entries()),
                flux: Array.from(this.chatHistories.flux.entries()),
                sd: Array.from(this.chatHistories.sd.entries()),
                video: Array.from(this.chatHistories.video.entries())
            };
            
            localStorage.setItem('chatHistories', JSON.stringify(historiesData));
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }

    updateHistoryList() {
        const historyList = document.querySelector('.chat-history-list');
        if (!historyList) return;

        // 清空现有列表
        historyList.innerHTML = '';

        // 获取当前模型的历史记录
        const currentModelHistory = this.chatHistories[this.currentModel];
        if (!currentModelHistory) return;

        // 模型名称映射
        const modelNames = {
            gpt: {
                name: 'GPT',
                tag: '<span class="model-tag gpt">GPT</span>'
            },
            zhipu: {
                name: '智谱AI',
                tag: '<span class="model-tag zhipu">智谱AI</span>'
            },
            qwen: 'Qwen',
            flux: {
                name: 'FLUX',
                tag: '<span class="model-tag flux">FLUX</span>'
            },
            sd: {
                tag: '<span class="model-tag sd">SD</span>',  // 添加统一的 SD 标签
                models: {
                    'stabilityai/stable-diffusion-3-5-large': 'v3.5',
                    'stabilityai/stable-diffusion-2-1': 'v2.1'
                }
            },
            video: {
                name: 'LTX-Video',
                tag: '<span class="model-tag video">LTX-Video</span>'
            }
        };

        // 创建历史记录列表
        const histories = Array.from(currentModelHistory.entries())
            .sort(([, a], [, b]) => b.timestamp - a.timestamp);

        histories.forEach(([chatId, chat]) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'chat-history-item';
            if (chatId === this.currentChatId) {
                historyItem.classList.add('active');
            }

            // 获取模型标签
            let modelLabel = '';
            if (this.currentModel === 'flux') {
                modelLabel = modelNames.flux.tag;
            } else if (this.currentModel === 'video') {
                modelLabel = modelNames.video.tag;
            } else if (this.currentModel === 'gpt') {
                modelLabel = modelNames.gpt.tag;
            } else if (this.currentModel === 'zhipu') {
                modelLabel = modelNames.zhipu.tag;
            } else if (this.currentModel === 'sd') {
                modelLabel = modelNames.sd.tag;  // 使用统一的 SD 标签
            } else {
                modelLabel = modelNames[this.currentModel] || '';
            }

            historyItem.innerHTML = `
                <div class="chat-info">
                    <div class="chat-title">${chat.title}</div>
                    <div class="chat-meta">
                        ${modelLabel}
                        <span class="chat-time">${this.formatTime(chat.timestamp)}</span>
                    </div>
                </div>
                <button class="chat-history-delete">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            // 点击对话
            historyItem.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-history-delete')) {
                    this.loadChat(chatId);
                }
            });

            // 删除对话
            historyItem.querySelector('.chat-history-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(chatId);
            });

            historyList.appendChild(historyItem);
        });
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

        // 保存对话属于当前模型
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

        // 如果除的当前对话，创建新对话
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
            // 移除旧的事件监听器
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // 添加新的事件监听器
            newBtn.addEventListener('click', async (e) => {
                const text = e.target.textContent;
                console.log('点击示例按钮:', text); // 添加调试日志

                // 清除欢迎界面
                const welcomeSection = document.querySelector('.welcome-section');
                if (welcomeSection) {
                    welcomeSection.remove();
                }

                // 添加用户消息到对话
                this.addMessageToChat('user', text);

                try {
                    // 根据不同模型处理点击事件
                    if (this.currentModel === 'flux' || this.currentModel === 'sd') {
                        await this.generateImage(text);
                    } else if (this.currentModel === 'video') {
                        console.log('开始生成视频:', text); // 添加调试日志
                        await this.generateVideo(text);
                    } else {
                        await this.getAIResponse(text);
                    }

                    // 保存对话历史
                    this.saveCurrentChat();
                } catch (error) {
                    console.error('处理示例提示词失败:', error);
                    this.addSystemMessage(`处理失败: ${error.message}`);
                }
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
        // 初始化新的 AbortController
        this.abortController = new AbortController();
        let progressInterval;
        let progressDiv;
        
        try {
            this.sendBtn.classList.add('loading');
            
            // 使用FLUX/SD头像显生成提示
            this.addSystemMessage('正在生成图像...', this.avatars.ai[this.currentModel]);
            
            // 添加进度条到系统消息后面
            progressDiv = document.createElement('div');
            progressDiv.className = 'image-generation-progress';
            progressDiv.style.margin = '10px auto';  // 添加边距
            progressDiv.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0%</div>
            `;
            
            // 确保进度条被添加到正确的位置
            const lastSystemMessage = Array.from(this.chatHistory.children)
                .filter(el => el.classList.contains('system-message'))
                .pop();
            
            if (lastSystemMessage) {
                lastSystemMessage.appendChild(progressDiv);
            } else {
                this.chatHistory.appendChild(progressDiv);
            }

            // 确保进度条可见
            this.chatHistory.scrollTop = this.chatHistory.scrollHeight;

            // 模拟进度更新
            let progress = 0;
            const progressFill = progressDiv.querySelector('.progress-fill');
            const progressText = progressDiv.querySelector('.progress-text');
            
            progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.random() * 2.6;  // 从 3 改为 2.6，降低到 30% 的速度
                    progress = Math.min(progress, 90);
                    progressFill.style.width = `${progress}%`;
                    progressText.textContent = `${Math.round(progress)}%`;
                    // 确保进度条可见
                    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
                }
            }, 250);  // 从 350ms 改为 400ms

            const enhancedPrompt = await this.optimizePrompt(prompt, 'image');
            const modelConfig = this.sdConfig.models[this.sdConfig.model];
            const requestBody = {
                model: this.sdConfig.model,
                prompt: enhancedPrompt,
                image_size: modelConfig.defaultSize,
                batch_size: 1,
                num_inference_steps: modelConfig.defaultSteps,
                guidance_scale: modelConfig.defaultGuidance,
                prompt_enhancement: true  // 启用提示词增强
            };

            // 发送请求前确保 abortController 存在
            if (!this.abortController) {
                this.abortController = new AbortController();
            }

            this.currentRequest = fetch(this.sdConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.sdConfig.apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: this.abortController.signal
            });

            const response = await this.currentRequest;
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Stable Diffusion 图像生成错误:', errorData);
                throw new Error(errorData.message || '图像生成失败');
            }

            const data = await response.json();
            console.log('Stable Diffusion 响应:', data);

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

            // 显示生成的图片
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
            if (error.name === 'AbortError') {
                console.log('请求已取消');
                // 找到最后一条系统消息并修改其容
                const systemMessages = Array.from(this.chatHistory.children)
                    .filter(el => el.classList.contains('system-message'));
                const lastSystemMessage = systemMessages[systemMessages.length - 1];
                if (lastSystemMessage) {
                    lastSystemMessage.querySelector('.message-content').textContent = '图片生成已取消';
                }
            } else {
                console.error('Stable Diffusion 图像生成错误:', error);
                this.addSystemMessage(`图像生成失败: ${error.message}`);
            }
        } finally {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            if (progressDiv && progressDiv.parentNode) {
                progressDiv.remove();
            }
            this.sendBtn.classList.remove('loading');
            this.currentRequest = null;
            // 清理 abortController
            if (this.abortController) {
                this.abortController = null;
            }
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
        this.abortController = new AbortController();
        // ... 其他代码保持不变 ...
    }

    // 添加取消当前请求的方法
    cancelCurrentRequest() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        if (this.currentRequest) {
            this.currentRequest = null;
        }
    }

    // 修改 generateVideo 方法，支持图生视频
    async generateVideo(prompt, imageUrl = null) {
        if (!prompt) {
            console.error('未收到提示词');
            return;
        }
        console.log('generateVideo 收到提示词:', prompt);
        if (imageUrl) {
            console.log('收到图片:', imageUrl);
        }

        this.abortController = new AbortController();
        let progressInterval;
        let progressDiv;
        
        try {
            // 清空输入框
            this.userInput.value = '';

            // 添加用户消息
            if (imageUrl) {
                const userMessageContent = `
                    <p>${prompt}</p>
                    <img src="${imageUrl}" alt="用户上传的图片" style="max-width: 300px; border-radius: 8px; margin-top: 10px;">
                `;
                this.addMessageToChat('user', userMessageContent, true);
            } else {
                this.addMessageToChat('user', prompt);
            }

            this.sendBtn.classList.add('loading');
            
            // 使用视频模型头像显示生成提示
            this.addSystemMessage('正在生成视频...', this.avatars.ai[this.currentModel]);
            
            // 添加进度条
            progressDiv = document.createElement('div');
            progressDiv.className = 'video-generation-progress';
            progressDiv.style.margin = '10px auto';
            progressDiv.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <div class="progress-text">0%</div>
            `;
            
            const lastSystemMessage = Array.from(this.chatHistory.children)
                .filter(el => el.classList.contains('system-message'))
                .pop();
            
            if (lastSystemMessage) {
                lastSystemMessage.appendChild(progressDiv);
            }

            // 模拟进度更新
            let progress = 0;
            const progressFill = progressDiv.querySelector('.progress-fill');
            const progressText = progressDiv.querySelector('.progress-text');
            
            progressInterval = setInterval(() => {
                if (progress < 85) {
                    progress += Math.random() * 1.5;
                    progress = Math.min(progress, 85);
                    progressFill.style.width = `${progress}%`;
                    progressText.textContent = `${Math.round(progress)}%`;
                }
            }, 1000);

            // 优化提示词
            const enhancedPrompt = await this.optimizePrompt(prompt, 'video');
            console.log('优化后的提示词:', enhancedPrompt);

            // 如果有图片，先上传到图床
            let imageLink = null;
            if (imageUrl) {
                try {
                    // 创建FormData对象
                    const formData = new FormData();
                    formData.append('key', '672b19ccee439f1b7875f3409fcab0ce');
                    
                    // 从base64中提取实际的图片数据
                    const imageData = imageUrl.split(',')[1];
                    formData.append('image', imageData);

                    // 发送请求到imgbb
                    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (!imgbbResponse.ok) {
                        throw new Error(`图床服务响应错误: ${imgbbResponse.status}`);
                    }

                    const imgbbData = await imgbbResponse.json();
                    if (!imgbbData.success) {
                        throw new Error('图片上传失败: ' + (imgbbData.error?.message || '未知错误'));
                    }

                    imageLink = imgbbData.data.url;
                    console.log('图片已上传到图床:', imageLink);
                } catch (error) {
                    console.error('上传图片到图床失败:', error);
                    this.addSystemMessage('图片上传失败，请重试');
                    return;
                }
            }

            // 提交视频生成请求
            const submitBody = {
                model: "Lightricks/LTX-Video",
                prompt: enhancedPrompt,
                negative_prompt: "",
                num_inference_steps: 30,
                guidance_scale: 7.5,
                width: 512,
                height: 512,
                num_frames: imageLink ? 24 : 16,  // 图生视频使用更多帧数
                fps: 8,
                motion_bucket_id: 127,
                seed: Math.floor(Math.random() * 2147483647)
            };

            // 如果有图片链接，添加到请求体
            if (imageLink) {
                submitBody.image = imageLink;
                console.log('添加图片到请求:', imageLink);
            }

            // 发送请求
            const submitResponse = await fetch(this.videoConfig.submitUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.videoConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitBody)
            });

            if (!submitResponse.ok) {
                throw new Error(`视频生成请求失败: ${await submitResponse.text()}`);
            }

            const submitData = await submitResponse.json();
            if (!submitData.requestId) {
                throw new Error('未获取到请求ID');
            }

            // 轮询获取视频状态
            while (true) {
                const statusResponse = await fetch(this.videoConfig.statusUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.videoConfig.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        requestId: submitData.requestId
                    })
                });

                if (!statusResponse.ok) {
                    throw new Error(`获取视频状态失败: ${await statusResponse.text()}`);
                }

                const statusData = await statusResponse.json();
                
                if (statusData.status === 'Succeed') {
                    // 完成进度条
                    if (progressInterval) {
                        clearInterval(progressInterval);
                    }
                    if (progressDiv) {
                        progressFill.style.width = '100%';
                        progressText.textContent = '100%';
                        setTimeout(() => progressDiv.remove(), 500);
                    }

                    // 显示生成的视频
                    this.addVideoMessage('ai', statusData.results.videos[0].url);
                    break;
                } else if (statusData.status === 'InProgress') {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    throw new Error(statusData.reason || '视频生成失败');
                }
            }

        } catch (error) {
            console.error('视频生成错误:', error);
            this.addSystemMessage(`视频生成失败: ${error.message}`);
        } finally {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
            if (progressDiv && progressDiv.parentNode) {
                progressDiv.remove();
            }
            this.sendBtn.classList.remove('loading');
            this.currentRequest = null;
            if (this.abortController) {
                this.abortController = null;
            }
        }
    }

    // 添加一个支持 HTML 内容的消息添加方法
    addMessageToChat(role, content, isHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = `<img src="${role === 'user' ? this.avatars.user : this.avatars.ai[this.currentModel]}" alt="${role} avatar">`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (isHTML) {
            messageContent.innerHTML = content;
        } else {
            messageContent.textContent = content;
        }

        if (role === 'user') {
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
        }

        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    // 添加一个通用的提示词优化方法
    async optimizePrompt(prompt, type = 'image') {
        console.group('提示词优化过程');
        console.log('原始提示词:', prompt);
        
        try {
            const systemPrompts = {
                image: "用户要使用图像生成模型，你需要扩写用户的输入提示词并用英语输出，只输出英语提示词，不要有废话",
                video: "用户要使用视频生成模型，你需要扩写用户的输入提示词并用英语输出，只输出英语提示词，不要有废话",
                imageToImage: "用户要使用图生图模型，你需要扩写用户的输入提示词并用英语输出，只输出英语提示词，不要有废话"
            };

            console.log('正在使用 Qwen 模型优化提示词...');
            const qwenResponse = await fetch(this.qwenConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.qwenConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'Qwen/Qwen2.5-7B-Instruct',
                    messages: [
                        {
                            role: "system",
                            content: systemPrompts[type]
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                })
            });

            if (!qwenResponse.ok) {
                throw new Error('提示词优化请求失败');
            }

            const qwenData = await qwenResponse.json();
            const enhancedPrompt = qwenData.choices[0].message.content.trim();
            
            console.log('优化后的英文提示词:', enhancedPrompt);
            console.log('✅ 提示词优化成功');
            return enhancedPrompt;

        } catch (error) {
            console.error('❌ 提示词优化失败:', error);
            console.log('将使用原始提示词继续生成');
            return prompt;
        } finally {
            console.groupEnd();
        }
    }

    updateButtons() {
        // 移除现有的按钮
        const existingButtons = document.querySelectorAll('.img2img-btn, .video-upload-btn');
        existingButtons.forEach(btn => btn.remove());

        const inputArea = document.querySelector('.input-area');
        
        // 如果是 SD 模型，且是 2.1 版本时，添加图生图按钮
        if (this.currentModel === 'sd') {
            const selectedModelText = document.querySelector('.sd-model-selector .selected-model span')?.textContent;
            if (selectedModelText?.includes('v2.1')) {
                const img2imgBtn = document.createElement('button');
                img2imgBtn.innerHTML = '<i class="fas fa-images"></i>';
                img2imgBtn.className = 'img2img-btn';
                img2imgBtn.title = '图生图';
                inputArea.insertBefore(img2imgBtn, this.sendBtn);
                
                // ... 图生图按钮的事件处理保持不变 ...
            }
        }
        
        // 如果是视频模型，添加图片上传按钮
        if (this.currentModel === 'video') {
            const videoUploadBtn = document.createElement('button');
            videoUploadBtn.innerHTML = '<i class="fas fa-image"></i>';
            videoUploadBtn.className = 'video-upload-btn';
            videoUploadBtn.title = '上传图片生成视频';
            inputArea.insertBefore(videoUploadBtn, this.sendBtn);

            videoUploadBtn.addEventListener('click', () => {
                const prompt = this.userInput.value.trim();
                if (!prompt) {
                    this.addSystemMessage('请先输入提示词，描述你想要的视频效果');
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
                        if (file.size > 5 * 1024 * 1024) {
                            this.addSystemMessage('图片大小不能超过5MB');
                            return;
                        }
                        const base64Data = await this.fileToBase64(file);
                        await this.generateVideo(prompt, base64Data);
                    }
                    fileInput.remove();
                });

                document.body.appendChild(fileInput);
                fileInput.click();
            });
        }
    }

    // 处理方向变化
    handleOrientationChange() {
        const orientation = window.orientation;
        const rotateScreen = document.getElementById('rotateScreen') || this.createRotateScreen();
        
        if (orientation === 0 || orientation === 180) { // 竖屏
            rotateScreen.style.display = 'flex';
            document.querySelector('.app-container').style.display = 'none';
        } else { // 横屏
            rotateScreen.style.display = 'none';
            document.querySelector('.app-container').style.display = 'flex';
        }
    }

    // 创建旋转提示界面
    createRotateScreen() {
        const rotateScreen = document.createElement('div');
        rotateScreen.id = 'rotateScreen';
        rotateScreen.innerHTML = `
            <div class="rotate-content">
                <i class="fas fa-mobile-alt"></i>
                <p>请旋转设备至横屏使用</p>
            </div>
        `;
        document.body.appendChild(rotateScreen);
        return rotateScreen;
    }

    // 请求全屏
    requestFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }
    }

    // 检测移动端并处理横屏
    handleMobileOrientation() {
        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // 添加移动端样式类
            document.body.classList.add('mobile-device');
            
            // 强制横屏
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape')
                    .then(() => {
                        // 尝试全屏
                        this.requestFullscreen();
                    })
                    .catch(err => {
                        console.log('无法锁定屏幕方向:', err);
                        // 如果无法锁定方向，仍然尝试全屏
                        this.requestFullscreen();
                    });
            } else {
                // 如果不支持方向锁定，只尝试全屏
                this.requestFullscreen();
            }

            // 监听方向变化
            window.addEventListener('orientationchange', () => {
                this.handleOrientationChange();
            });

            // 初始检查方向
            this.handleOrientationChange();
        }
    }

    // 添加处理开屏页面的方法
    handleSplashScreen() {
        const appContainer = document.querySelector('.app-container');
        
        // 1.5秒后显示主页面
        setTimeout(() => {
            appContainer.style.opacity = '1';
            appContainer.style.transition = 'opacity 0.5s ease';
        }, 1500);
    }
}

// 初始应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new AIChatApp();
});