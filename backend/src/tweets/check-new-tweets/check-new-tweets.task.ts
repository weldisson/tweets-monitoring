import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Interval } from '@nestjs/schedule';
import { TweetsService } from '../tweets.service';

@Injectable()
export class CheckNewTweetsTask {
  private limit = 10;

  constructor(
    private tweetService: TweetsService,
    @Inject(CACHE_MANAGER)
    private cache: Cache,
  ) {}

  @Interval(5000)
  async handle() {
    console.log('search tweets...');
    let offset: any = await this.cache.get<number>('tweet-offset');
    offset = offset === undefined || offset == null ? 0 : offset;

    console.log(`offset: ${offset}`);

    const tweets = await this.tweetService.findAll({
      offset,
      limit: this.limit,
    });

    console.log(`tweets count: ${tweets.length}`);

    if (tweets.length === this.limit) {
      console.log('new tweets');
      await this.cache.set('tweet-offset', offset + this.limit, {
        ttl: 1 * 60 * 10, // one minute.
      });
      console.log('send-email'); // todo
    }
  }
}
