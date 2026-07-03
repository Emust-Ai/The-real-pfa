import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { FavoritesModule } from './favorites/favorites.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { ScrapingModule } from './scraping/scraping.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagingModule } from './messaging/messaging.module';
import { AdminModule } from './admin/admin.module';
import { SavedSearchesModule } from './saved-searches/saved-searches.module';
import { ReviewsModule } from './reviews/reviews.module';
import { GroqModule } from './groq/groq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    FavoritesModule,
    InquiriesModule,
    ScrapingModule,
    NotificationsModule,
    AdminModule,
    SavedSearchesModule,
    MessagingModule,
    ReviewsModule,
    GroqModule,
  ],
})
export class AppModule {}
