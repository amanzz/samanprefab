import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { generalRateLimit } from './middleware/rate-limit.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import productsRouter from './modules/products/products.routes';
import quotesRouter from './modules/quotes/quotes.routes';
import authRouter from './modules/auth/auth.routes';
import citiesRouter from './modules/cities/cities.routes';
import categoriesRouter from './modules/categories/categories.routes';
import mediaRouter from './modules/media/media.routes';
import citySeoRouter from './modules/city-seo-pages/city-seo-pages.routes';
import sitemapRouter from './modules/sitemap/sitemap.routes';
import redirectsRouter from './modules/redirects/redirects.routes';
import notFoundLogRouter from './modules/not-found-log/not-found-log.routes';
import settingsRouter from './modules/settings/settings.routes';
import revalidateRouter from './modules/revalidate/revalidate.routes';
import feedRouter from './modules/feed/feed.routes';
import attributesRouter from './modules/attributes/attributes.routes';
import postsRouter from './modules/posts/posts.routes';
import postCategoriesRouter from './modules/post-categories/post-categories.routes';
import postTagsRouter from './modules/post-tags/post-tags.routes';
import aiSettingsRouter from './modules/ai-settings/ai-settings.routes';
import notificationsRouter from './modules/notifications/notifications.routes';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { config } from './config/index';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1', generalRateLimit);

// Force no-cache on all API responses — admin must always receive real-time data
app.use('/api/v1', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/uploads', express.static(path.resolve(config.upload.dir)));

app.use(sitemapRouter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/quotes', quotesRouter);
app.use('/api/v1/cities', citiesRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/city-seo-pages', citySeoRouter);
app.use('/api/v1/redirects', redirectsRouter);
app.use('/api/v1/not-found-log', notFoundLogRouter);
app.use('/api/v1/settings', settingsRouter);
app.use('/api/v1/revalidate', revalidateRouter);
app.use('/api/v1/feed', feedRouter);
app.use('/api/v1/attributes', attributesRouter);
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/post-categories', postCategoriesRouter);
app.use('/api/v1/post-tags', postTagsRouter);
app.use('/api/v1/ai-settings', aiSettingsRouter);
app.use('/api/v1/admin/notifications', notificationsRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
