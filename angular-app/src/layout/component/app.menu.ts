import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Main',
                items: [
                    { label: 'Campaign Manager', icon: 'pi pi-fw pi-sitemap', routerLink: ['/manage_campaign'] },
                    { label: 'Pipeline', icon: 'pi pi-fw pi-sync', routerLink: ['/pipeline'] },
                                          {
                                label: 'Generate Ads',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                                        { label: 'Inspired Ads', icon: 'pi pi-fw pi-sparkles', routerLink: ['/inspired_ads'] },
                                    { label: 'Upload Product Image', icon: 'pi pi-fw pi-image', routerLink: ['/product_images']  }
                                ]
                            },
                    { label: 'Budget', icon: 'pi pi-fw pi-pound', class: 'rotated-icon', routerLink: ['/budget'] },

                ]
            },
            {
                label: 'See More',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
               { label: 'Terms Of Service', icon: 'pi pi-fw pi-building', routerLink: ['/terms_of_service'] },
                    { label: 'Privacy Policy', icon: 'pi pi-fw pi-file-word', routerLink: ['/privacy_policy'] },                    {
                        label: 'View Source',
                        icon: 'pi pi-fw pi-github',
                        url: 'https://github.com/alinafghan/AdVisory_FYP',
                        target: '_blank'
                    }
                ]
            },
    
             {
                label: 'Log Out',
                items: [
                    {
                        label: 'Log Out',
                        icon: 'pi pi-fw pi-sign-out',
                         routerLink: ['/landing']
                    }
                ]
            }
        ];
    }
}