# Generated by Django 3.1.1 on 2020-10-09 20:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0002_bid_category_comment_listing'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listing',
            name='category',
            field=models.CharField(max_length=64),
        ),
        migrations.DeleteModel(
            name='Category',
        ),
    ]
