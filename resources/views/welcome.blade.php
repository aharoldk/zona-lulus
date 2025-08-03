<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Zona Lulus</title>

        <!-- Midtrans Snap Script -->
        @if(config('services.midtrans.is_production'))
            <script type="text/javascript" src="https://app.midtrans.com/snap/snap.js" data-client-key="{{ config('services.midtrans.client_key') }}"></script>
        @else
            <script type="text/javascript" src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="{{ config('services.midtrans.client_key') }}"></script>
        @endif

        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
