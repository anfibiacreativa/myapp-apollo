import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Subscription } from 'rxjs';
import gql from 'graphql-tag';
// We use the gql tag to parse our query string into a query document
const AllKitten = gql`
  query AllKitten {
    kittens {
      id
      name
    }
  }
`;
@Component({
  selector: 'app-cat-teaser',
  templateUrl: './cat-teaser.component.html',
  styleUrls: ['./cat-teaser.component.scss']
})
export class CatTeaserComponent implements OnInit, OnDestroy, AfterViewInit {
  loading: boolean;
  kittens: any[];
  config: any = {
    // Root margin determines distance from viewport in the Y axis
    rootMargin: '20px 0px',
    threshold: 0.03
  };
  observer: any;
  urlPrefix: String = '../../assets/kitten/';
  urlSuffix: String = '.png';
  private querySubscription: Subscription;

  constructor(
    private apollo: Apollo
  ) {}

  lazyLoadCats() {
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {

          if (entry.isIntersecting) {
            this.observer.unobserve(entry.target);
            this.preloadCats(entry.target);
          }
        });
      }, this.config);
  }

  preloadCats(entry) {
    console.log(entry + 'yay');
  }

  ngOnInit() {
    this.querySubscription = this.apollo.watchQuery<any>({
      query: AllKitten
    })
    .valueChanges
    .subscribe(({ data, loading }) => {
      this.loading = loading;
      this.kittens = data.kittens;
    });
  }

  ngAfterViewInit() {
    const self: any = this;
    setTimeout(function() {
      const images: NodeListOf<HTMLElement> = document.querySelectorAll('.catIsLazy');
      images.forEach(image => {
        self.observer.observe(image);
      });
    }, 300);
    this.lazyLoadCats();
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}
