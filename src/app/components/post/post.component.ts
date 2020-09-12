import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { from } from 'rxjs';
import {
  faThumbsDown,
  faThumbsUp,
  faShareSquare,
} from '@fortawesome/free-solid-svg-icons';
import { AngularFireDatabase } from '@angular/fire/database';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit, OnChanges {
  @Input() post;

  faThumbsDown = faThumbsDown;
  faThumbsUp = faThumbsUp;
  faShareSquare = faShareSquare;

  uid = null;
  upvote = 0;
  downvote = 0;

  constructor(private db: AngularFireDatabase, private auth: AuthService) {
    auth.getUser().subscribe((user) => {
      this.uid = user?.uid;
    });
  }

  ngOnInit(): void {}

  ngOnChanges() {
    if (this.post.vote) {
      Object.values(this.post.vote).map((value: any) => {
        if (value.upvote) {
          this.upvote += 1;
        }
        if (value.downvote) {
          this.downvote += 1;
        }
      });
    }
  }

  upvotePost() {
    this.db.object(`/posts/${this.post.id}/vote/${this.uid}`).set({
      upvote: 1,
    });
  }

  downvotePost() {
    this.db.object(`/posts/${this.post.id}/vote/${this.uid}`).set({
      downvote: 1,
    });
  }

  getInstaUrl() {
    return `https://instagram.com/${this.post.instaId}`;
  }
}
