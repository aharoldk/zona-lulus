<?php

namespace Database\Seeders;

use App\Models\CoinPackage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CoinPackageSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Starter Pack',
                'description' => 'Perfect for getting started with basic features',
                'coins' => 100,
                'price' => 10000,
                'bonus' => 0,
                'popular' => false,
                'sort_order' => 1
            ],
            [
                'name' => 'Popular Pack',
                'description' => 'Most popular choice with great value and bonus coins',
                'coins' => 500,
                'price' => 45000,
                'bonus' => 50,
                'popular' => true,
                'sort_order' => 2
            ],
            [
                'name' => 'Value Pack',
                'description' => 'Great value for regular users with substantial bonus',
                'coins' => 1000,
                'price' => 85000,
                'bonus' => 150,
                'popular' => false,
                'sort_order' => 3
            ],
            [
                'name' => 'Power Pack',
                'description' => 'For power users who need more coins with excellent bonus',
                'coins' => 2000,
                'price' => 160000,
                'bonus' => 400,
                'popular' => false,
                'sort_order' => 4
            ],
            [
                'name' => 'Ultimate Pack',
                'description' => 'Maximum value with the highest bonus percentage',
                'coins' => 5000,
                'price' => 375000,
                'bonus' => 1250,
                'popular' => false,
                'sort_order' => 5
            ]
        ];

        foreach ($packages as $package) {
            CoinPackage::updateOrCreate(
                $package
            );
        }
    }
}
