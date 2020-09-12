import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { readAndCompressImage } from 'browser-image-resizer';
import { v4 as uuidv4 } from 'uuid';

import { AuthService } from '../../services/auth.service';
import { imageConfig } from 'src/utils/config';

@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css'],
})
export class AddpostComponent implements OnInit {
  locationName: string;
  description: string;
  picture: string = null;
  user = null;
  uploadPercent = null;

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    private auth: AuthService,
    private router: Router
  ) {
    // Gives LoggedIn User's details
    auth.getUser().subscribe((user) => {
      this.db
        .object(`/users/${user.uid}`)
        .valueChanges()
        .subscribe((user) => {
          this.user = user;
        }); // Any changes in that user in db will be notified --> "valuechanges()"
    });
  }

  ngOnInit(): void {}

  async uploadFile(event) {
    const file = event.target.files[0];
    let resizedImage = await readAndCompressImage(file, imageConfig);
    const filePath = file.name;
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercent = percentage;
    });

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success('Image Uploaded');
          });
        })
      )
      .subscribe();
  }

  onSubmit() {
    const uid = uuidv4();
    this.db
      .object(`/posts/${uid}`)
      .set({
        id: uid,
        locationName: this.locationName,
        description: this.description,
        picture: this.picture,
        by: this.user.name,
        instaId: this.user.instaUserName,
        date: Date.now(),
      })
      .then((data) => {
        this.toastr.success('Post was successfully Uploaded');
        this.router.navigateByUrl('/');
      })
      .catch((err) => {
        this.toastr.error('Failed to upload the post');
      });
  }
}
