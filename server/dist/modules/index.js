import { container } from '../di/container.js';
import { logger } from '../infra/logger/logger.js';
import { createCacheService } from '../infra/cache/cache.service.js';
// ── Books Module ──────────────────────────────────────────────
import { createBooksRoutes } from './books/routes/index.js';
import { BookService } from './books/services/BookService.js';
import { OpenLibraryProvider } from './books/services/providers/OpenLibraryProvider.js';
import { GoogleBooksProvider } from './books/services/providers/GoogleBooksProvider.js';
// ── AI Module ─────────────────────────────────────────────────
import { createAiRoutes } from './ai/routes/index.js';
import { AiChatService } from './ai/services/AiChatService.js';
import { AiGateway } from './ai/gateway/AiGateway.js';
import { ProviderManager } from './ai/gateway/ProviderManager.js';
import { OpenRouterProvider } from './ai/gateway/providers/OpenRouterProvider.js';
import { GeminiProvider } from './ai/gateway/providers/GeminiProvider.js';
// ── Auth Module ───────────────────────────────────────────────
import { createAuthRoutes } from './auth/routes/index.js';
import { AuthService } from './auth/services/AuthService.js';
import { RefreshTokenStore } from './auth/services/RefreshTokenStore.js';
// ── New TS Modules ────────────────────────────────────────────
import { createLogsRoutes } from './logs/routes/index.js';
import { LogsService } from './logs/services/LogsService.js';
import { createFavoritesRoutes } from './favorites/routes/index.js';
import { FavoritesService } from './favorites/services/FavoritesService.js';
import { createChatRoutes } from './chat/routes/index.js';
import { ChatService } from './chat/services/ChatService.js';
import { createProfileRoutes } from './profile/routes/index.js';
import { ProfileService } from './profile/services/ProfileService.js';
import { createFriendsRoutes } from './friends/routes/index.js';
import { FriendsService } from './friends/services/FriendsService.js';
// ── DNA Module ────────────────────────────────────────────────
import { createDnaRoutes } from './dna/routes/index.js';
import { DnaComputeService } from './dna/services/DnaComputeService.js';
import { DnaEventService } from './dna/services/DnaEventService.js';
export function registerModules(app) {
    const cache = createCacheService();
    container.register('cache', cache);
    // ── Auth Module ──────────────────────────────────────────────
    const refreshTokenStore = new RefreshTokenStore();
    container.register('refreshTokenStore', refreshTokenStore);
    setInterval(() => { refreshTokenStore.cleanupExpired().catch(() => { }); }, 3600000).unref();
    const authService = new AuthService(refreshTokenStore);
    container.register('authService', authService);
    const authRouter = createAuthRoutes(authService);
    app.use('/api/auth', authRouter);
    logger.info({ module: 'auth' }, 'Auth module registered');
    // ── Books Module ──────────────────────────────────────────────
    const openLibrary = new OpenLibraryProvider();
    const googleBooks = new GoogleBooksProvider();
    const bookService = new BookService(openLibrary, googleBooks, cache);
    container.register('bookService', bookService);
    const booksRouter = createBooksRoutes(bookService);
    app.use('/api/books', booksRouter);
    logger.info({ module: 'books' }, 'Books module registered');
    // ── AI Module ──────────────────────────────────────────────────
    const providerManager = new ProviderManager();
    const openRouter = new OpenRouterProvider();
    const gemini = new GeminiProvider();
    providerManager.registerProvider(openRouter);
    providerManager.registerProvider(gemini);
    providerManager.startHealthChecks();
    container.register('providerManager', providerManager);
    const aiGateway = new AiGateway(providerManager);
    container.register('aiGateway', aiGateway);
    const aiChatService = new AiChatService(aiGateway);
    container.register('aiChatService', aiChatService);
    const aiRouter = createAiRoutes(aiChatService);
    app.use('/api/ai', aiRouter);
    logger.info({ module: 'ai', providers: ['openrouter', 'gemini'] }, 'AI module registered');
    // ── Logs Module ──────────────────────────────────────────────
    const logsService = new LogsService();
    container.register('logsService', logsService);
    const logsRouter = createLogsRoutes(logsService);
    app.use('/api/logs', logsRouter);
    logger.info({ module: 'logs' }, 'Logs module registered');
    // ── Favorites Module ─────────────────────────────────────────
    const favoritesService = new FavoritesService();
    container.register('favoritesService', favoritesService);
    const favoritesRouter = createFavoritesRoutes(favoritesService);
    app.use('/api/favorites', favoritesRouter);
    logger.info({ module: 'favorites' }, 'Favorites module registered');
    // ── Chat Module ──────────────────────────────────────────────
    const chatService = new ChatService();
    container.register('chatService', chatService);
    const chatRouter = createChatRoutes(chatService);
    app.use('/api/chat', chatRouter);
    logger.info({ module: 'chat' }, 'Chat module registered');
    // ── Profile Module ───────────────────────────────────────────
    const profileService = new ProfileService();
    container.register('profileService', profileService);
    const profileRouter = createProfileRoutes(profileService);
    app.use('/api/profile', profileRouter);
    logger.info({ module: 'profile' }, 'Profile module registered');
    // ── Friends Module ───────────────────────────────────────────
    const friendsService = new FriendsService();
    container.register('friendsService', friendsService);
    const friendsRouter = createFriendsRoutes(friendsService);
    app.use('/api/friends', friendsRouter);
    logger.info({ module: 'friends' }, 'Friends module registered');
    // ── DNA Module ──────────────────────────────────────────────
    const dnaComputeService = new DnaComputeService();
    container.register('dnaComputeService', dnaComputeService);
    const dnaEventService = new DnaEventService(dnaComputeService);
    container.register('dnaEventService', dnaEventService);
    const dnaRouter = createDnaRoutes(dnaComputeService);
    app.use('/api/dna', dnaRouter);
    logger.info({ module: 'dna' }, 'DNA module registered');
    const names = container.getModuleNames();
    if (names.length > 0) {
        logger.info({ modules: names }, 'Modules loaded');
    }
}
//# sourceMappingURL=index.js.map