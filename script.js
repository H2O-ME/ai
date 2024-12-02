class AIChatApp {
    constructor() {
        // 添加全局错误处理
        window.addEventListener('error', (event) => {
            // 忽略扩展程序相关的错误
            if (event.message.includes('Receiving end does not exist')) {
                event.preventDefault();
                return;
            }
        });

        // 初始化基础配置
        this.currentModel = 'zhipu';  // 默认模型
        this.conversationHistory = [];
        this.chatHistories = {
            gpt: new Map(),
            zhipu: new Map()
        };
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

        // 添加GPT模型配置
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

        // 初始化GPT模型选择器
        this.initializeGPTModelSelector();
    }

    initializeConfigs() {
        // 基础配置
        this.currentModel = 'zhipu';
        
        // API配置
        this.zhipuConfig = {
            apiKey: '8807fe42fcf8fa1208077876878dadbb.4xSEX4vp1Dzkx2WP',
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
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
                zhipu: 'https://chatglm.cn/img/logo-collapse.d00ef130.svg'
            },
            user: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzY2NjY2NiIgZD0iTTEyIDJhMTAgMTAgMCAxIDAgMTAgMTBBMTAgMTAgMCAwIDAgMTIgMnptMCA1YTMgMyAwIDEgMSAwIDYgMyAzIDAgMCAxIDAtNnptMCAxM2E4LjAxIDguMDEgMCAwIDEtNi0yLjczVjE2YTMgMyAwIDAgMSAzLTNoNmEzIDMgMCAwIDEgMyAzdjEuMjdhOC4wMSA4LjAxIDAgMCAxLTYgMi43M3oiLz48L3N2Zz4=',
            system: 'https://chatglm.cn/img/logo-collapse.d00ef130.svg'
        };
        
        // 支持的文件类型
        this.supportedFiles = {
            image: ['image/jpeg', 'image/png', 'image/gif'],
            video: ['video/mp4']
        };
        
        // 对话历史管理
        this.currentChatId = Date.now().toString();
        this.chatHistories = new Map();
        this.conversationHistory = [];

        // 添加GPT配置
        this.gptConfig = {
            apiKey: 'sk-qCSVaohpHgxmgMY4p88O7TA4oNf8zGgBDofQRPMZFXv58HGh',
            baseUrl: 'https://api.chatanywhere.tech/v1/chat/completions',
            model: 'gpt-3.5-turbo-1106'
        };

        // 初始化完成后，如果当前是GPT模型，显示模型选择器
        if (this.currentModel === 'gpt') {
            const gptModelSelector = document.querySelector('.gpt-model-selector');
            if (gptModelSelector) {
                gptModelSelector.style.display = 'block';
            }
        }
    }

    initializeElements() {
        this.chatHistory = document.getElementById('chatHistory');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.modelBtns = document.querySelectorAll('.model-btn');
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
        
        // 根据不同模型显示不同的欢迎界面
        const welcomeContent = this.currentModel === 'gpt' ? {
            title: 'ChatGPT',
            description: '基于OpenAI的GPT模型',
            suggestions: [
                '你好，请做个自我介绍',
                '帮我写一段Python代码',
                '解释一下量子力学',
                '写一篇短文章'
            ]
        } : {
            title: 'AI对话助手',
            description: '基于智谱AI的GLM大模型',
            suggestions: [
                '你好，请做个自我介绍',
                '帮我分析一段代码',
                '解释一个概念',
                '分析一个问题'
            ]
        };
        
        // 创建欢迎界面
        const welcomeSection = document.createElement('div');
        welcomeSection.className = 'welcome-section';
        welcomeSection.innerHTML = `
            <div class="ai-avatar">
                <img src="${this.avatars.ai[this.currentModel]}" alt="AI头像">
            </div>
            <h2>${welcomeContent.title}</h2>
            <p>${welcomeContent.description}</p>
            <div class="suggestion-grid">
                ${welcomeContent.suggestions.map(text => 
                    `<button class="suggestion-btn">${text}</button>`
                ).join('')}
            </div>
        `;
        
        this.chatHistory.appendChild(welcomeSection);
        
        // 绑定建议按钮事件
        this.bindSuggestionButtons();

        // 清空输入框
        if (this.userInput) {
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
        }

        // 更新史列表
        this.updateHistoryList();
    }

    initializeEventListeners() {
        try {
            // 发送消息事件
            this.sendBtn.addEventListener('click', () => this.sendMessage());
            this.userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // 切换模型事件
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
        } catch (error) {
            if (!error.message.includes('Receiving end does not exist')) {
                console.error('事件监听器初始化失败:', error);
            }
        }
    }

    initializeTextarea() {
        let resizeTimeout;
        this.userInput.addEventListener('input', () => {
            // 清除之前的定时器
            clearTimeout(resizeTimeout);
            
            // 设置新的定时器
            resizeTimeout = setTimeout(() => {
                this.userInput.style.height = 'auto';
                this.userInput.style.height = this.userInput.scrollHeight + 'px';
            }, 10);
        });
    }

    switchModel(model, createNew = true) {
        try {
            // 确保 chatHistories 结构完整
            if (!this.chatHistories) {
                this.chatHistories = {
                    gpt: new Map(),
                    zhipu: new Map()
                };
            }
            
            if (!this.chatHistories[model]) {
                this.chatHistories[model] = new Map();
            }

            // 保存当前对话
            if (this.currentChatId) {
                this.saveCurrentChat();
            }

            // 切换模型
            this.currentModel = model;
            
            // 更新UI
            this.modelBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.model === model);
            });

            // 更新GPT模型选择器显示状态
            const gptModelSelector = document.querySelector('.gpt-model-selector');
            if (gptModelSelector) {
                gptModelSelector.style.display = model === 'gpt' ? 'block' : 'none';
            }

            // 更新文件上传按钮状态
            this.updateFileUploadButton();

            // 清空当前对话ID和历史
            this.currentChatId = null;
            this.conversationHistory = [];

            if (createNew) {
                // 获取当前模型的最新对话
                const histories = Array.from(this.chatHistories[model].entries())
                    .filter(([, chat]) => chat.model === model)
                    .sort(([, a], [, b]) => b.timestamp - a.timestamp);

                if (histories.length > 0) {
                    // 加载最新的对话
                    this.loadChat(histories[0][0]);
                } else {
                    // 创建新对话
                    this.createNewChat(true);
                }
            }
        } catch (error) {
            console.error('切换模型失败:', error);
            // 发生错误时重置到初始状态
            this.chatHistories = {
                gpt: new Map(),
                zhipu: new Map()
            };
            this.createNewChat(true);
        }
    }

    setupFileUpload() {
        const uploadBtn = document.createElement('button');
        uploadBtn.innerHTML = '<i class="fas fa-file-upload"></i>';
        uploadBtn.className = 'upload-btn';
        uploadBtn.title = '上传图片或视频';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,video/mp4';
        fileInput.style.display = 'none';
        fileInput.id = 'fileUpload';

        // 添加文件大小限制
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.type.startsWith('video/') && file.size > 20 * 1024 * 1024) {  // 20MB
                    this.addSystemMessage('视频大小不能超过20MB');
                    e.target.value = '';
                    return;
                }
                if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {  // 5MB
                    this.addSystemMessage('图片大小不能超过5MB');
                    e.target.value = '';
                    return;
                }
                this.handleFileUpload(e);
            }
        });

        const inputArea = document.querySelector('.input-area');
        inputArea.insertBefore(uploadBtn, this.sendBtn);
        inputArea.appendChild(fileInput);

        uploadBtn.addEventListener('click', () => fileInput.click());
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查当前模型是否支持图片
        if (this.currentModel === 'gpt' && 
            !this.gptConfig.models[this.gptConfig.model].supportImage) {
            this.addSystemMessage('当前GPT模型不支持图片处理');
            return;
        }

        try {
            this.addSystemMessage('正在处理文件...');

            const base64Data = await this.fileToBase64(file);
            const isVideo = this.supportedFiles.video.includes(file.type);
            const isImage = this.supportedFiles.image.includes(file.type);

            if (isVideo) {
                await this.handleVideoUpload(base64Data);
            } else if (isImage) {
                await this.handleImageUpload(base64Data);
            } else {
                throw new Error('不支持的文件类型');
            }
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

            // 构建消息对
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
                        text: "请仔细描述这个视频"
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
                            url: base64Data  // 直接使用base64数据
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
        const formData = new FormData();
        formData.append('image', base64Image.split(',')[1]);
        formData.append('key', this.imgbbConfig.apiKey);

        const response = await fetch(this.imgbbConfig.uploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('图片上传到图床失败');
        }

        const data = await response.json();
        return data.data.display_url;
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

    async sendMessage(text = null, imageUrl = null) {
        const message = text || this.userInput.value.trim();
        if (!message && !imageUrl) return;

        // 添加发送按钮加载状态
        this.sendBtn.classList.add('loading');
        
        try {
            // 清除欢迎部分
            const welcomeSection = document.querySelector('.welcome-section');
            if (welcomeSection) {
                welcomeSection.remove();
            }

            // 添加用户消息到聊天界面
            if (message) {
                this.addMessageToChat('user', message);
            }
            this.userInput.value = '';
            this.userInput.style.height = 'auto';

            // 获取AI响应
            await this.getAIResponse(message, imageUrl);
            this.saveCurrentChat();  // 保存对话
        } finally {
            // 移除发送按钮加载状态
            this.sendBtn.classList.remove('loading');
        }
    }

    addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // 添加头像
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const avatarImg = document.createElement('img');
        
        // 根据发送者和当前模型选择正确的头像
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
        if (this.currentModel === 'zhipu') {
            return await this.getZhipuResponse(message, imageUrl);
        } else {
            return await this.getGPTResponse(message);
        }
    }

    async getZhipuResponse(message, fileUrl = null) {
        try {
            this.sendBtn.classList.add('loading');
            
            let requestBody = {
                model: "glm-4v-plus",
                messages: [],
                stream: true
            };

            // 构建消息内容
            if (typeof message === 'string') {
                // 纯文本消息
                requestBody.messages.push({
                    role: "user",
                    content: [{
                        type: "text",
                        text: message
                    }]
                });
            } else if (message.content) {
                // 多态消息（图片或视频）
                requestBody.messages.push(message);
            }

            // 添加历史对话记录
            if (this.conversationHistory.length > 0) {
                requestBody.messages = [
                    ...this.conversationHistory,
                    requestBody.messages[0]
                ];
            }

            const response = await fetch(this.zhipuConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.zhipuConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

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
                    content: [{
                        type: "text",
                        text: message
                    }]
                });
            } else {
                this.conversationHistory.push(message);
            }

            this.conversationHistory.push({
                role: "assistant",
                content: fullContent
            });

            return fullContent;
        } catch (error) {
            console.error('智谱AI API调用错误:', error);
            return '抱歉，服务器出现错误请稍后再试。';
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    async getGPTResponse(message) {
        try {
            this.sendBtn.classList.add('loading');
            
            let requestBody = {
                model: this.gptConfig.model,
                messages: [],
                stream: true,
                temperature: 0.7,
                // 添加额外的参数
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

            // 添加历史对话记录（限制长度以避免超出token限制）
            if (this.conversationHistory.length > 0) {
                // 只保留最近的10条消息
                const recentHistory = this.conversationHistory.slice(-10);
                requestBody.messages = [
                    ...recentHistory,
                    requestBody.messages[0]
                ];
            }

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
                console.error('GPT API错误:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
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
            return '抱歉，服务器出现错误，请稍后再试。错误信息：' + error.message;
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
        video.muted = true;  // 添加静音属性
        
        // 添加错误处理
        video.onerror = () => {
            console.error('视频加载失败:', video.error);
            this.addSystemMessage('视频加载失败，请重试');
        };
        
        // 添加加载处理
        video.onloadedmetadata = () => {
            video.muted = false;  // 加载完成后取消静音
        };
        
        messageContent.appendChild(video);
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    // 修改系统消息显示方法
    addSystemMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'system-message');
        
        // 添加系统消息头像
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = this.avatars.system;
        avatarImg.alt = 'system avatar';
        avatar.appendChild(avatarImg);
        messageDiv.appendChild(avatar);
        
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
                    console.error(`${key} 头像URL不可访问:`, url);
                }
            } catch (error) {
                console.error(`测试 ${key} 头像URL时出错:`, error);
            }
        }
    }

    // 添加历史记录管理方法
    loadChatHistories() {
        try {
            const savedHistories = localStorage.getItem('chatHistories');
            if (savedHistories) {
                const histories = JSON.parse(savedHistories);
                // 确保两个模型的 Map 都被正确初始化
                this.chatHistories = {
                    gpt: new Map(histories.gpt || []),
                    zhipu: new Map(histories.zhipu || [])
                };
            } else {
                // 如果没有保存的历史记录，初始化空的 Map
                this.chatHistories = {
                    gpt: new Map(),
                    zhipu: new Map()
                };
            }
        } catch (error) {
            console.error('加载历史记录失败:', error);
            // 如果加载失败，初始化空的历史记录
            this.chatHistories = {
                gpt: new Map(),
                zhipu: new Map()
            };
        }
        this.updateHistoryList();
    }

    saveChatHistories() {
        try {
            // 确保 chatHistories 的结构正确
            const histories = {
                gpt: Array.from(this.chatHistories.gpt?.entries() || []),
                zhipu: Array.from(this.chatHistories.zhipu?.entries() || [])
            };
            
            localStorage.setItem('chatHistories', JSON.stringify(histories));
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }

    updateHistoryList() {
        const historyList = document.querySelector('.chat-history-list');
        historyList.innerHTML = '';

        // 只获取当前模型的历史记录
        const histories = Array.from(this.chatHistories[this.currentModel].entries())
            .filter(([, chat]) => chat.model === this.currentModel)  // 确保只显示当前模型的对话
            .sort(([, a], [, b]) => b.timestamp - a.timestamp);

        if (histories.length === 0) {
            historyList.innerHTML = `
                <div class="chat-history-empty">
                    暂无历史对话
                </div>
            `;
            return;
        }

        // 模型名称映射
        const modelNames = {
            gpt: 'GPT',
            zhipu: '智谱AI'
        };

        for (const [id, chat] of histories) {
            const historyItem = document.createElement('div');
            historyItem.className = `chat-history-item${id === this.currentChatId ? ' active' : ''}`;
            historyItem.innerHTML = `
                <div class="chat-history-content">
                    <div class="chat-history-title">
                        <span class="model-tag ${chat.model}">${modelNames[chat.model]}</span>
                        <span>${chat.title || '新对话'}</span>
                    </div>
                    <div class="chat-history-time">${this.formatTime(chat.timestamp)}</div>
                </div>
                <div class="chat-history-delete" title="删除对话">
                    <i class="fas fa-trash"></i>
                </div>
            `;

            // 点击加载对话
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
        try {
            if (!this.currentChatId || !this.currentModel) return;

            // 确保 chatHistories 结构完整
            if (!this.chatHistories) {
                this.chatHistories = {
                    gpt: new Map(),
                    zhipu: new Map()
                };
            }

            if (!this.chatHistories[this.currentModel]) {
                this.chatHistories[this.currentModel] = new Map();
            }

            // 获取第一条非系统消息作为标题
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

            // 创建对话数据
            const chatData = {
                id: this.currentChatId,
                title,
                timestamp: Date.now(),
                messages: messages.map(el => el.outerHTML),
                conversationHistory: this.conversationHistory,
                model: this.currentModel
            };

            // 保存到当前模型的历史记录中
            this.chatHistories[this.currentModel].set(this.currentChatId, chatData);
            
            // 保存到localStorage
            this.saveChatHistories();
            
            // 更新UI
            this.updateHistoryList();
        } catch (error) {
            console.error('保存当前对话失败:', error);
            // 如果保存失败，确保基础结构完整
            this.chatHistories = {
                gpt: new Map(),
                zhipu: new Map()
            };
        }
    }

    loadChat(chatId) {
        // 保存当前对话
        if (this.currentChatId) {
            this.saveCurrentChat();
        }

        // 只在当前模型的历史记录中查找
        const chatData = this.chatHistories[this.currentModel].get(chatId);
        if (!chatData) return;

        // 确保对话属于当前模型
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

        // 如果删除的是当前对话，创建新对话
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
        if (uploadBtn) {
            const currentModel = this.gptConfig.models[this.gptConfig.model];
            if (this.currentModel === 'gpt' && !currentModel.supportImage) {
                uploadBtn.style.display = 'none';
            } else {
                uploadBtn.style.display = 'flex';
            }
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new AIChatApp();
});