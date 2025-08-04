
    public function down()
    {
        Schema::dropIfExists('coin_transactions');
    }
};
